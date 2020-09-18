import { Injectable } from '@angular/core';

import dayjs from 'dayjs';

import { CdDevice } from '../models/devices';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  /**
   * Calculates additional data and appends them as new attributes to the given device.
   */
  calculateAdditionalData(device: CdDevice): CdDevice {
    if (!device.life_expectancy_min || !device.life_expectancy_max) {
      device.state = 'unknown';
      return device;
    }
    const hasDate = (float: string): boolean => !!Number.parseFloat(float);
    const weeks = (isoDate1: string, isoDate2: string): number =>
      !isoDate1 || !isoDate2 || !hasDate(isoDate1) || !hasDate(isoDate2)
        ? null
        : dayjs(isoDate1).diff(isoDate2, 'week');

    const ageOfStamp = dayjs().diff(device.life_expectancy_stamp, 'week');
    const max = weeks(device.life_expectancy_max, device.life_expectancy_stamp);
    const min = weeks(device.life_expectancy_min, device.life_expectancy_stamp);

    if (ageOfStamp > 1) {
      device.state = 'stale';
    } else if (max !== null && max <= 2) {
      device.state = 'bad';
    } else if (min !== null && min <= 4) {
      device.state = 'warning';
    } else {
      device.state = 'good';
    }

    device.life_expectancy_weeks = {
      max: max !== null ? Math.round(max) : null,
      min: min !== null ? Math.round(min) : null
    };

    return device;
  }

  readable(device: CdDevice): CdDevice {
    device.readableDaemons = device.daemons.join(' ');
    return device;
  }

  prepareDevice(device: CdDevice): CdDevice {
    return this.readable(this.calculateAdditionalData(device));
  }
}
