import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'cd-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit {
  content_data: any = {};
  fscid: number;
  fs_name: string;

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit() {
    this.fscid = +this.route.snapshot.paramMap.get('id');

    this.http
      .get('/clients_main_data/' + this.fscid + '/')
      .subscribe((data: any) => {
        this.fs_name = data.fs_name;
      });

    this.refresh();
  }

  refresh() {
    this.http
      .get('/clients_data/' + this.fscid + '/')
      .subscribe(data => {
        this.content_data.clients = data;
        setTimeout(() => {
          this.refresh();
        }, 5000);
      });
  }
}
