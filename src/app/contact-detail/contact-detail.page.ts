import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
import { arrowBack, pencil, trash } from 'ionicons/icons';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactService, Contact } from '../services/contact.service';

@Component({
  selector: 'app-contact-detail',
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" (click)="onBack()">
            <ion-icon [icon]="arrowBack"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Detalle</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" (click)="onEdit()" *ngIf="contact">
            <ion-icon [icon]="pencil"></ion-icon>
          </ion-button>
          <ion-button color="danger" fill="clear" (click)="onDelete()" *ngIf="contact">
            <ion-icon [icon]="trash"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div *ngIf="contact; else empty" class="detail-wrapper">
        <div class="avatar-wrap">
          <img *ngIf="contact.foto" [src]="contact.foto" class="avatar" />
        </div>

        <div class="info">
          <h2 class="name">{{contact.nombre}} {{contact.apellido}}</h2>

          <div class="details">
            <div><strong>Empresa:</strong> {{contact.empresa || '-'}}</div>
            <div><strong>Teléfono:</strong> {{contact.telefono || '-'}}</div>
            <div><strong>Correo:</strong> {{contact.correo || '-'}}</div>
            <div><strong>Dirección:</strong> {{contact.direccion || '-'}}</div>
            <div><strong>Nota:</strong> {{contact.nota || '-'}}</div>
          </div>
        </div>
      </div>
      <ng-template #empty>
        <div class="empty">Contacto no encontrado.</div>
      </ng-template>
    </ion-content>
  `,
  styles: [`
    .empty { text-align:center; margin-top: 2rem; color: var(--ion-color-medium); }
  `]
})
export class ContactDetailPage implements OnInit {
  contact: Contact | undefined;
  arrowBack = arrowBack;
  pencil = pencil;
  trash = trash;
  contactId: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private contactService: ContactService) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.contactId = id;
      if (!id) {
        this.router.navigate(['/contactos']);
        return;
      }
      this.contact = this.contactService.getById(id);
      if (!this.contact) {
        // Si no lo encuentra, vuelve a la lista
        setTimeout(() => this.router.navigate(['/contactos']), 700);
      }
    });
  }

  onBack() {
    this.router.navigate(['/contactos']);
  }

  onEdit() {
    if (!this.contactId) return;
    this.router.navigate(['/contactos', this.contactId, 'edit']);
  }

  onDelete() {
    if (!this.contactId) return;
    const c = this.contactService.getById(this.contactId);
    if (!c) return;
    const conf = confirm(`Eliminar contacto: ${c.nombre} ${c.apellido}?`);
    if (!conf) return;
    this.contactService.delete(this.contactId);
    this.router.navigate(['/contactos']);
  }
}