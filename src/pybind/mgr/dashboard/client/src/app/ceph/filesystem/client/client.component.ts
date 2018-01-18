import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'cd-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit {
  contentData: any = {};
  fscid: number;
  fsName: string;

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit() {
    this.fscid = +this.route.snapshot.paramMap.get('id');

    this.http
      .get('/clients_main_data/' + this.fscid + '/')
      .subscribe((data: any) => {
        this.fsName = data.fs_name;
      });

    this.refresh();
  }

  refresh() {
    this.http
      .get('/clients_data/' + this.fscid + '/')
      .subscribe(data => {
        this.contentData.clients = data;
        setTimeout(() => {
          this.refresh();
        }, 5000);
      });
  }
}
