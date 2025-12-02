import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonTextarea, IonButton, IonButtons, IonIcon, IonList, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { save, arrowBack, trash } from 'ionicons/icons';
import { ContactService, Contact } from '../services/contact.service';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonTextarea, IonButton, IonButtons, IonIcon, IonList, IonGrid, IonRow, IonCol],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" (click)="onCancel()">
            <ion-icon [icon]="arrowBack"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>{{ isEdit ? 'Editar contacto' : 'Nuevo contacto' }}</ion-title>
        <ion-buttons slot="end" *ngIf="isEdit">
          <ion-button color="danger" fill="clear" (click)="onDelete()">
            <ion-icon [icon]="trash"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <ion-list>
          <ion-item>
            <ion-label position="stacked">Foto</ion-label>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <img *ngIf="preview" [src]="preview" style="width:64px;height:64px;border-radius:8px;object-fit:cover;"/>
              <input type="file" accept="image/*" (change)="onFileSelected($event)" />
              <ion-button *ngIf="preview" fill="clear" color="danger" (click)="removePhoto()">Eliminar</ion-button>
            </div>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Nombre *</ion-label>
            <ion-input formControlName="nombre" type="text"></ion-input>
          </ion-item>
          <div *ngIf="form.controls['nombre'].invalid && form.controls['nombre'].touched" class="error">Nombre es requerido</div>

          <ion-item>
            <ion-label position="stacked">Apellido *</ion-label>
            <ion-input formControlName="apellido" type="text"></ion-input>
          </ion-item>
          <div *ngIf="form.controls['apellido'].invalid && form.controls['apellido'].touched" class="error">Apellido es requerido</div>

          <ion-item>
            <ion-label position="stacked">Empresa</ion-label>
            <ion-input formControlName="empresa" type="text"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Teléfono</ion-label>
            <ion-input formControlName="telefono" type="tel"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Correo</ion-label>
            <ion-input formControlName="correo" type="email"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Dirección</ion-label>
            <ion-input formControlName="direccion" type="text"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Nota</ion-label>
            <ion-textarea formControlName="nota"></ion-textarea>
          </ion-item>
        </ion-list>

        <ion-grid>
          <ion-row>
            <ion-col>
              <ion-button expand="full" color="primary" type="submit" [disabled]="form.invalid">
                <ion-icon slot="start" [icon]="save"></ion-icon>
                Guardar
              </ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
      </form>
    </ion-content>
  `,
  styles: [`
    .error { color: var(--ion-color-danger); margin: 0.5rem 1rem; font-size: 0.9rem; }
  `]
})
export class ContactFormPage implements OnInit {
  form: FormGroup;
  isEdit = false;
  contactId: string | null = null;
  arrowBack = arrowBack;
  save = save;
  trash = trash;

  constructor(private fb: FormBuilder, private contactService: ContactService, private router: Router, private route: ActivatedRoute) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      empresa: [''],
      telefono: [''],
      correo: [''],
      direccion: [''],
      nota: [''],
      foto: [''],
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEdit = true;
        this.contactId = id;
        const c = this.contactService.getById(id);
        if (c) {
          this.form.patchValue({
            nombre: c.nombre,
            apellido: c.apellido,
            empresa: c.empresa,
            telefono: c.telefono,
            correo: c.correo,
            direccion: c.direccion,
            nota: c.nota,
            foto: c.foto || ''
          });
          this.preview = c.foto || null;
        }
      } else {
        this.isEdit = false;
        this.contactId = null;
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.form.value;
    if (this.isEdit && this.contactId) {
      const existing = this.contactService.getById(this.contactId);
      if (!existing) return;
      const updated: Contact = { ...existing, ...payload, id: this.contactId };
      this.contactService.update(updated);
    } else {
      this.contactService.create(payload);
    }
    this.router.navigate(['/contactos']);
  }

  onCancel() {
    this.router.navigate(['/contactos']);
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

  preview: string | null = null;

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    try {
      const data = await this.readFileAsDataURL(file);
      this.preview = data;
      this.form.patchValue({ foto: data });
    } catch (e) {
      console.error('Error leyendo archivo', e);
    }
  }

  readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = (e) => reject(e);
      fr.readAsDataURL(file);
    });
  }

  removePhoto() {
    this.preview = null;
    this.form.patchValue({ foto: '' });
  }
}