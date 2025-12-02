import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonButtons, IonFab, IonFabButton, IonSearchbar } from '@ionic/angular/standalone';
import { add, create, trash, eye, pencil } from 'ionicons/icons';
import { ContactService, Contact } from '../services/contact.service';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonButtons, IonFab, IonFabButton, IonSearchbar],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title>Contactos</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="onAdd()">
            <ion-icon slot="icon-only" [icon]="create"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding">
      <ion-searchbar placeholder="Buscar por nombre, apellido o empresa" [(ngModel)]="query" (ionInput)="filter()"></ion-searchbar>

      <ion-list>
        <ion-item *ngFor="let c of visibleContacts">
          <img *ngIf="c.foto" [src]="c.foto" style="width:48px;height:48px;border-radius:8px;object-fit:cover;margin-right:12px;" />
          <ion-label>
            <h2>{{c.nombre}} {{c.apellido}}</h2>
            <p>{{c.empresa}} · {{c.telefono}}</p>
            <p class="muted">{{c.correo}}</p>
          </ion-label>
          <ion-buttons slot="end">
            <ion-button fill="clear" (click)="onView(c.id)">
              <ion-icon slot="icon-only" [icon]="eye"></ion-icon>
            </ion-button>
            <ion-button fill="clear" (click)="onEdit(c.id)">
              <ion-icon slot="icon-only" [icon]="pencil"></ion-icon>
            </ion-button>
            <ion-button color="danger" (click)="onDelete(c.id)">
              <ion-icon slot="icon-only" [icon]="trash"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-item>
      </ion-list>

      <div *ngIf="(contacts?.length ?? 0) === 0" class="empty">
        No hay contactos. Presiona + para crear uno.
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button (click)="onAdd()">
          <ion-icon [icon]="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [`
    .muted { color: var(--ion-color-medium); font-size: 0.9rem; }
    .empty { text-align:center; margin-top: 2rem; color: var(--ion-color-medium); }
  `]
})
export class ContactListPage implements OnInit {
  contacts: Contact[] = [];
  visibleContacts: Contact[] = [];
  contacts$ = this.contactService.getAll();
  query = '';
  create = create;
  add = add;
  trash = trash;
  eye = eye;
  pencil = pencil;

  constructor(private contactService: ContactService, private router: Router) {}

  ngOnInit() {
    this.contactService.seedExampleIfEmpty();
    this.contacts$.subscribe(list => {
      this.contacts = list;
      this.filter();
    });
  }

  filter() {
    const q = this.query?.toLowerCase?.() ?? '';
    if (!q) {
      this.visibleContacts = this.contacts.slice();
      return;
    }
    this.visibleContacts = this.contacts.filter(c =>
      (c.nombre + ' ' + c.apellido + ' ' + (c.empresa ?? '') + ' ' + (c.telefono ?? '') + ' ' + (c.correo ?? '')).toLowerCase().includes(q)
    );
  }

  onAdd() {
    this.router.navigate(['/contactos/new']);
  }

  onView(id: string) {
    this.router.navigate(['/contactos', id]);
  }

  onEdit(id: string) {
    this.router.navigate(['/contactos', id, 'edit']);
  }

  onDelete(id: string) {
    const c = this.contactService.getById(id);
    if (!c) return;
    const conf = confirm(`Eliminar contacto: ${c.nombre} ${c.apellido}?`);
    if (!conf) return;
    this.contactService.delete(id);
  }
}