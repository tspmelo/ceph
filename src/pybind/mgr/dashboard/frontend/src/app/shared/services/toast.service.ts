import { Injectable, TemplateRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts: any[] = [];

  show(textOrTpl: string | TemplateRef<any>, options: any = {}) {
    this.toasts.push({ textOrTpl, ...options });
  }

  remove(toast: any) {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }

  success(text: string) {
    this.show('I am a success toast', { classname: 'bg-success text-light', delay: 10000 });

    this.show(null, text);
  }

  error(text: string) {
    this.show(text, { classname: 'bg-danger text-light', delay: 15000 });
  }
}
