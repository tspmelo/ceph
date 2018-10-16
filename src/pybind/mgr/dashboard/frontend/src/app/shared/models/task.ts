export class Task {
  name: string;
  metadata: object;
  description: string;

  constructor(name?, metadata?) {
    this.name = name;
    this.metadata = metadata;
  }
}
