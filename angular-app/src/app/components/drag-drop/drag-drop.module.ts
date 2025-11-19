import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';

// Components
import { IngredienteComponent } from './ingrediente/ingrediente.component';
import { PlatoDropZoneComponent } from './plato-drop-zone/plato-drop-zone.component';

@NgModule({
  declarations: [
    IngredienteComponent,
    PlatoDropZoneComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    FormsModule
  ],
  exports: [
    IngredienteComponent,
    PlatoDropZoneComponent
  ]
})
export class DragDropComponentsModule { }
