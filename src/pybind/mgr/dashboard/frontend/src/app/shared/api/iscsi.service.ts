import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ApiModule } from './api.module';

@Injectable({
  providedIn: ApiModule
})
export class IscsiService {
  constructor(private http: HttpClient) {}

  targetAdvancedSettings = {
    cmdsn_depth: {
      help: ''
    },
    dataout_timeout: {
      help: ''
    },
    first_burst_length: {
      help: ''
    },
    immediate_data: {
      help: ''
    },
    initial_r2t: {
      help: ''
    },
    max_burst_length: {
      help: ''
    },
    max_outstanding_r2t: {
      help: ''
    },
    max_recv_data_segment_length: {
      help: ''
    },
    max_xmit_data_segment_length: {
      help: ''
    },
    nopin_response_timeout: {
      help: ''
    },
    nopin_timeout: {
      help: ''
    }
  };

  imageAdvancedSettings = {
    hw_max_sectors: {
      help: ''
    },
    max_data_area_mb: {
      help: ''
    },
    osd_op_timeout: {
      help: ''
    },
    qfull_timeout: {
      help: ''
    }
  };

  listTargets() {
    return this.http.get(`api/iscsi/target`);
  }

  getTarget(target_iqn: string) {
    return this.http.get(`api/iscsi/target/${target_iqn}`);
  }

  status() {
    return this.http.get(`ui-api/iscsi/status`);
  }

  settings() {
    return this.http.get(`ui-api/iscsi/settings`);
  }

  portals() {
    return this.http.get(`ui-api/iscsi/portals`);
  }

  createTarget(target) {
    return this.http.post(`api/iscsi/target`, target, { observe: 'response' });
  }

  editTarget(target) {
    return this.http.put(`api/iscsi/target/${target.target_iqn}`, target, { observe: 'response' });
  }

  deleteTarget(targetIqn) {
    return this.http.delete(`api/iscsi/target/${targetIqn}`, { observe: 'response' });
  }
}
