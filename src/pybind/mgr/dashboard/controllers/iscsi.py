# -*- coding: utf-8 -*-
from __future__ import absolute_import

import cherrypy

import rados
import rbd

from . import ApiController, RESTController, BaseController, Endpoint, ReadPermission
from .. import mgr
from .. import logger
from ..rest_client import RequestException
from ..security import Scope
from ..services.iscsi_client import IscsiClient
from ..exceptions import DashboardException

@ApiController('/iscsi', Scope.ISCSI)
class Iscsi(BaseController):

    @Endpoint()
    @ReadPermission
    def status(self):
        status = {'available': False}
        try:
            IscsiClient.instance().get_config()
            status['available'] = True
        except RequestException:
            pass
        return status


@ApiController('/iscsi/target', Scope.ISCSI)
class IscsiTarget(RESTController):

    def list(self):
        config = IscsiClient.instance().get_config()
        targets = []
        for target_iqn in config['targets'].keys():
            target = IscsiTarget._config_to_target(target_iqn, config)
            targets.append(target)
        return targets

    def get(self, target_iqn):
        config = IscsiClient.instance().get_config()
        if target_iqn not in config['targets']:
            raise cherrypy.HTTPError(404)
        return IscsiTarget._config_to_target(target_iqn, config)

    # TODO tasks / async calls
    def create(self, target_iqn=None, target_controls=None,
               portals=[], disks=[], clients=[], groups=[]):
        # TODO remove disks, clients, etc.. that doesn't exist on request
        # TODO support groups
        if len(portals) < 2:
            raise DashboardException(msg='At least two portal are required',
                                     code='portals_required',
                                     component='iscsi')
        try:
            logger.debug('Creating target {}'.format(target_iqn))
            IscsiClient.instance().create_target(target_iqn, target_controls)
            config = IscsiClient.instance().get_config()
            target_config = config['targets'][target_iqn]
            first_portal_ip = portals[0]['ip']
            for portal in portals:
                host = portal['host']
                ip = portal['ip']
                if host not in target_config['portals']:
                    logger.debug('Creating portal {}:{}'.format(host, ip))
                    IscsiClient.instance(host=first_portal_ip).create_gateway(target_iqn, host, ip)
                else:
                    logger.debug('Creating portal {}:{} - SKIPPED'.format(host, ip))
            for disk in disks:
                pool = disk['pool']
                image = disk['image']
                try:
                    ioctx = mgr.rados.open_ioctx(pool)
                    try:
                        rbd.Image(ioctx, image)
                    except rbd.ImageNotFound:
                        raise DashboardException(msg='Image does not exist',
                                                 code='image_does_not_exist',
                                                 component='iscsi')
                except rados.ObjectNotFound:
                    raise DashboardException(msg='Pool does not exist',
                                             code='pool_does_not_exist',
                                             component='iscsi')
                image_id = '{}.{}'.format(pool, image)
                if image_id not in config['disks']:
                    logger.debug('Creating disk {}'.format(image_id))
                    IscsiClient.instance(host=first_portal_ip).create_disk(image_id)
                else:
                    logger.debug('Creating disk {} - SKIPPED'.format(image_id))
                if image_id not in target_config['disks']:
                    logger.debug('Creating target disk {}'.format(image_id))
                    IscsiClient.instance(host=first_portal_ip).create_target_lun(target_iqn, image_id)
                else:
                    logger.debug('Creating target disk {} - SKIPPED'.format(image_id))
                controls = disk['controls']
                if controls:
                    logger.debug('Creating disk controls')
                    IscsiClient.instance(host=first_portal_ip).reconfigure_disk(image_id, controls)
            for client in clients:
                client_iqn = client['client_iqn']
                if client_iqn not in target_config['clients']:
                    logger.debug('Creating client {}'.format(client_iqn))
                    IscsiClient.instance(host=first_portal_ip).create_client(target_iqn, client_iqn)
                else:
                    logger.debug('Creating client {} - SKIPPED'.format(client_iqn))
                for lun in client['luns']:
                    pool = lun['pool']
                    image = lun['image']
                    image_id = '{}.{}'.format(pool, image)
                    if image_id not in target_config['clients'][client_iqn]['luns']:
                        logger.debug('Creating client lun {}'.format(image_id))
                        IscsiClient.instance(host=first_portal_ip).create_client_lun(target_iqn, client_iqn, image_id)
                    else:
                        logger.debug('Creating client lun {} - SKIPPED'.format(image_id))
                user = client['auth']['user']
                password = client['auth']['password']
                chap = '{}/{}'.format(user, password) if user and password else ''
                logger.debug('Creating auth {}'.format(chap))
                IscsiClient.instance(host=first_portal_ip).create_client_auth(target_iqn, client_iqn, chap)
            if target_controls:
                logger.debug('Creating target controls')
                IscsiClient.instance(host=first_portal_ip).reconfigure_target(target_iqn, target_controls)

        except RequestException as e:
            raise DashboardException(e=e, component='iscsi')

    @staticmethod
    def _config_to_target(target_iqn, config):
        target_config = config['targets'][target_iqn]
        portals = []
        for host, portal_config in target_config['portals'].items():
            portal = {
                'host': host,
                'ip': portal_config['portal_ip_address']
            }
            portals.append(portal)
        disks = []
        for target_disk in target_config['disks']:
            disk_config = config['disks'][target_disk]
            disk = {
                'pool': disk_config['pool'],
                'image': disk_config['image'],
                'controls': disk_config['controls'],
            }
            disks.append(disk)
        clients = []
        for client_iqn, client_config in target_config['clients'].items():
            luns = []
            for client_lun in client_config['luns'].keys():
                pool, image = client_lun.split('.', 1)
                lun = {
                    'pool': pool,
                    'image': image
                }
                luns.append(lun)
            user = None
            password = None
            if '/' in client_config['auth']['chap']:
                user, password = client_config['auth']['chap'].split('/', 1)
            client = {
                'client_iqn': client_iqn,
                'luns': luns,
                'auth': {
                    'user': user,
                    'password': password
                }
            }
            clients.append(client)
        groups = []
        for group_id, group_config in target_config['groups'].items():
            group_disks = []
            for group_disk_key, _ in group_config['disks'].items():
                pool, image = group_disk_key.split('.', 1)
                group_disk = {
                    'pool': pool,
                    'image': image
                }
                group_disks.append(group_disk)
            group = {
                'group_id': group_id,
                'disks': group_disks,
                'members': group_config['members'],
            }
            groups.append(group)
        target = {
            'target_iqn': target_iqn,
            'portals': portals,
            'disks': disks,
            'clients': clients,
            'groups': groups,
            'target_controls': target_config['controls'],
        }
        return target
