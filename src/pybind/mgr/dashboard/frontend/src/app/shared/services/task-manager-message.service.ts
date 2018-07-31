import { Injectable } from '@angular/core';

import { Components } from '../enum/components.enum';
import { FinishedTask } from '../models/finished-task';
import { Task } from '../models/task';
import { ServicesModule } from './services.module';

class TaskManagerMessage {
  descr: (metadata) => string;
  running: (metadata) => string;
  success: (metadata) => string;
  error: (metadata) => object;

  constructor(
    descr: (metadata) => string,
    running: (metadata) => string,
    success: (metadata) => string,
    error: (metadata) => object
  ) {
    this.descr = descr;
    this.running = running;
    this.success = success;
    this.error = error;
  }
}

@Injectable({
  providedIn: ServicesModule
})
export class TaskManagerMessageService {
  messages = {
    'rbd/create': new TaskManagerMessage(
      (metadata) => `Create RBD '${metadata.pool_name}/${metadata.image_name}'`,
      (metadata) => `Creating RBD '${metadata.pool_name}/${metadata.image_name}'`,
      (metadata) =>
        `RBD '${metadata.pool_name}/${metadata.image_name}' has been created successfully`,
      (metadata) => {
        return {
          '17': `Name '${metadata.pool_name}/${metadata.image_name}' is already in use.`
        };
      }
    ),
    'rbd/edit': new TaskManagerMessage(
      (metadata) => `Update RBD '${metadata.pool_name}/${metadata.image_name}'`,
      (metadata) => `Updating RBD '${metadata.pool_name}/${metadata.image_name}'`,
      (metadata) =>
        `RBD '${metadata.pool_name}/${metadata.image_name}' has been updated successfully`,
      (metadata) => {
        return {
          '17': `Name '${metadata.pool_name}/${metadata.name}' is already in use.`
        };
      }
    ),
    'rbd/delete': new TaskManagerMessage(
      (metadata) => `Delete RBD '${metadata.pool_name}/${metadata.image_name}'`,
      (metadata) => `Deleting RBD '${metadata.pool_name}/${metadata.image_name}'`,
      (metadata) =>
        `RBD '${metadata.pool_name}/${metadata.image_name}' has been deleted successfully`,
      (metadata) => {
        return {
          '39': `RBD image contains snapshots.`
        };
      }
    ),
    'rbd/clone': new TaskManagerMessage(
      (metadata) => `Clone RBD '${metadata.child_pool_name}/${metadata.child_image_name}'`,
      (metadata) => `Cloning RBD '${metadata.child_pool_name}/${metadata.child_image_name}'`,
      (metadata) =>
        `RBD '${metadata.child_pool_name}/${
          metadata.child_image_name
        }' has been cloned successfully`,
      (metadata) => {
        return {
          '17': `Name '${metadata.child_pool_name}/${
            metadata.child_image_name
          }' is already in use.`,
          '22': `Snapshot must be protected.`
        };
      }
    ),
    'rbd/copy': new TaskManagerMessage(
      (metadata) => `Copy RBD '${metadata.dest_pool_name}/${metadata.dest_image_name}'`,
      (metadata) => `Copying RBD '${metadata.dest_pool_name}/${metadata.dest_image_name}'`,
      (metadata) =>
        `RBD '${metadata.dest_pool_name}/${metadata.dest_image_name}' has been copied successfully`,
      (metadata) => {
        return {
          '17': `Name '${metadata.dest_pool_name}/${metadata.dest_image_name}' is already in use.`
        };
      }
    ),
    'rbd/flatten': new TaskManagerMessage(
      (metadata) => `Flatten RBD '${metadata.pool_name}/${metadata.image_name}'`,
      (metadata) => `Flattening RBD '${metadata.pool_name}/${metadata.image_name}'`,
      (metadata) =>
        `RBD '${metadata.pool_name}/${metadata.image_name}' has been flattened successfully`,
      () => {
        return {};
      }
    ),
    'rbd/snap/create': new TaskManagerMessage(
      (metadata) =>
        `Create snapshot ` +
        `'${metadata.pool_name}/${metadata.image_name}@${metadata.snapshot_name}'`,
      (metadata) =>
        `Creating snapshot ` +
        `'${metadata.pool_name}/${metadata.image_name}@${metadata.snapshot_name}'`,
      (metadata) =>
        `Snapshot ` +
        `'${metadata.pool_name}/${metadata.image_name}@${metadata.snapshot_name}' ` +
        `has been created successfully`,
      (metadata) => {
        return {
          '17': `Name '${metadata.snapshot_name}' is already in use.`
        };
      }
    ),
    'rbd/snap/edit': new TaskManagerMessage(
      (metadata) =>
        `Update snapshot ` +
        `'${metadata.pool_name}/${metadata.image_name}@${metadata.snapshot_name}'`,
      (metadata) =>
        `Updating snapshot ` +
        `'${metadata.pool_name}/${metadata.image_name}@${metadata.snapshot_name}'`,
      (metadata) =>
        `Snapshot ` +
        `'${metadata.pool_name}/${metadata.image_name}@${metadata.snapshot_name}' ` +
        `has been updated successfully`,
      () => {
        return {
          '16': `Cannot unprotect snapshot because it contains child images.`
        };
      }
    ),
    'rbd/snap/delete': new TaskManagerMessage(
      (metadata) =>
        `Delete snapshot ` +
        `'${metadata.pool_name}/${metadata.image_name}@${metadata.snapshot_name}'`,
      (metadata) =>
        `Deleting snapshot ` +
        `'${metadata.pool_name}/${metadata.image_name}@${metadata.snapshot_name}'`,
      (metadata) =>
        `Snapshot ` +
        `'${metadata.pool_name}/${metadata.image_name}@${metadata.snapshot_name}' ` +
        `has been deleted successfully`,
      () => {
        return {
          '16': `Snapshot is protected.`
        };
      }
    ),
    'rbd/snap/rollback': new TaskManagerMessage(
      (metadata) =>
        `Rollback snapshot ` +
        `'${metadata.pool_name}/${metadata.image_name}@${metadata.snapshot_name}'`,
      (metadata) =>
        `Rolling back snapshot ` +
        `'${metadata.pool_name}/${metadata.image_name}@${metadata.snapshot_name}'`,
      (metadata) =>
        `Snapshot ` +
        `'${metadata.pool_name}/${metadata.image_name}@${metadata.snapshot_name}' ` +
        `has been rolled back successfully`,
      () => {
        return {};
      }
    ),
    'rbd/trash/move': new TaskManagerMessage(
      (metadata) => `Move RBD to trash`,
      (metadata) => `Moving RBD '${metadata.pool_name}/${metadata.image_name}' to trash`,
      (metadata) =>
        `RBD '${metadata.pool_name}/${metadata.image_name}' has been moved successfully`,
      (metadata) => {
        return {
          2: `Could not find image.`
        };
      }
    ),
    'rbd/trash/restore': new TaskManagerMessage(
      (metadata) => `Restore RBD`,
      (metadata) =>
        `Restoring RBD '${metadata.pool_name}/${metadata.image_name}@${metadata.image_id}' \
        into '${metadata.pool_name}/${metadata.new_image_name}'`,
      (metadata) =>
        `RBD '${metadata.pool_name}/${metadata.new_image_name}' has been restored successfully`,
      (metadata) => {
        return {
          17: `Image name '${metadata.pool_name}/${metadata.new_image_name}' is already in use.`
        };
      }
    )
  };

  defaultMessage = new TaskManagerMessage(
    (metadata) => {
      return Components[metadata.component] || metadata.component || 'Unknown Task';
    },
    (metadata) => {
      return (
        'Executing ' + (Components[metadata.component] || metadata.component || 'unknown task')
      );
    },
    (metadata) => 'Task executed successfully',
    () => {
      return {};
    }
  );

  constructor() {}

  getSuccessMessage(finishedTask: FinishedTask) {
    const taskManagerMessage = this.messages[finishedTask.name] || this.defaultMessage;
    return taskManagerMessage.success(finishedTask.metadata);
  }

  getErrorMessage(finishedTask: FinishedTask) {
    const taskManagerMessage = this.messages[finishedTask.name] || this.defaultMessage;
    return (
      taskManagerMessage.error(finishedTask.metadata)[finishedTask.exception.code] ||
      finishedTask.exception.detail
    );
  }

  getDescription(task: Task) {
    const taskManagerMessage = this.messages[task.name] || this.defaultMessage;
    return taskManagerMessage.descr(task.metadata);
  }

  getRunningMessage(task: Task) {
    const taskManagerMessage = this.messages[task.name] || this.defaultMessage;
    return taskManagerMessage.running(task.metadata);
  }
}
