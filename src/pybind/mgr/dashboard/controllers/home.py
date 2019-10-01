# -*- coding: utf-8 -*-
from __future__ import absolute_import

import os
import re
import json

import cherrypy
from cherrypy.lib.static import serve_file

from . import Controller, UiApiController, BaseController, Proxy, Endpoint
from .. import mgr, logger


LANGUAGES = {f for f in os.listdir(mgr.get_frontend_path())
             if os.path.isdir(os.path.join(mgr.get_frontend_path(), f))}
LANGUAGES_PATH_MAP = {f.lower(): {'lang': f, 'path': os.path.join(mgr.get_frontend_path(), f)}
                      for f in LANGUAGES}
# pre-populating with the primary language subtag
for _lang in list(LANGUAGES_PATH_MAP.keys()):
    if '-' in _lang:
        LANGUAGES_PATH_MAP[_lang.split('-')[0]] = {
            'lang': LANGUAGES_PATH_MAP[_lang]['lang'], 'path': LANGUAGES_PATH_MAP[_lang]['path']}


def _get_default_language():
    with open("{}/../package.json".format(mgr.get_frontend_path()), "r") as f:
        config = json.load(f)
    return config['config']['locale']


DEFAULT_LANGUAGE = _get_default_language()
DEFAULT_LANGUAGE_PATH = os.path.join(mgr.get_frontend_path(), DEFAULT_LANGUAGE)


@Controller("/", secure=False)
class HomeController(BaseController):
    LOCALE_RE = re.compile(r'(^[a-zA-Z]{1,8})(-[a-zA-Z0-9]{1,8})?$')  # RFC 4647

    def _parse_accept_language(self):
        if 'Accept-Language' in cherrypy.request.headers:
            accept_lang_header = cherrypy.request.headers['Accept-Language']
        else:
            return [DEFAULT_LANGUAGE]

        accept_langs = [l.strip() for l in accept_lang_header.split(",")]
        result = []
        for accept_lang in accept_langs:
            if ';' in accept_lang:
                lang = accept_lang.split(';')[0].strip().lower()
                try:
                    ratio = float(accept_lang.split(';')[1].strip()[2:])
                except ValueError:
                    raise cherrypy.HTTPError(400, "Malformed 'Accept-Language' header")
            else:
                lang = accept_lang.strip().lower()
                ratio = 1.0
            l_match = self.LOCALE_RE.match(lang)
            if l_match is None:
                raise cherrypy.HTTPError(400, "Malformed 'Accept-Language' header")
            result.append((l_match[0], ratio))
        result.sort(key=lambda l: l[0])
        result.sort(key=lambda l: l[1], reverse=True)
        logger.debug("language preference: %s", result)
        return [l[0] for l in result]

    def _language_dir(self, langs):
        for lang in langs:
            if lang in LANGUAGES_PATH_MAP:
                logger.debug("found directory for language '%s'", lang)
                cherrypy.response.headers['Content-Language'] = LANGUAGES_PATH_MAP[lang]['lang']
                return LANGUAGES_PATH_MAP[lang]['path']

        logger.debug("Languages '%s' not available, falling back to english", langs)
        cherrypy.response.headers['Content-Language'] = DEFAULT_LANGUAGE
        return DEFAULT_LANGUAGE_PATH

    @Proxy()
    def __call__(self, path, **params):
        if not path:
            path = "index.html"

        if 'cd-lang' in cherrypy.request.cookie:
            langs = [cherrypy.request.cookie['cd-lang'].value.lower()]
            logger.debug("frontend language from cookie: %s", langs)
        else:
            langs = self._parse_accept_language()
            logger.debug("frontend language from headers: %s", langs)

        base_dir = self._language_dir(langs)
        full_path = os.path.join(base_dir, path)
        logger.debug("serving static content: %s", full_path)
        if 'Vary' in cherrypy.response.headers:
            cherrypy.response.headers['Vary'] = "{}, Content-Language"
        else:
            cherrypy.response.headers['Vary'] = "Content-Language"
        return serve_file(full_path)


@UiApiController("/langs", secure=False)
class LangsController(BaseController):
    @Endpoint('GET')
    def __call__(self):
        return list(LANGUAGES)
