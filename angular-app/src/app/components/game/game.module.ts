import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';

// Componentes
import { GameComponent } from './game.component';
import { PersonajesComponent } from '../personajes/personajes.component';
import { IngredientesComponent } from '../ingredientes/ingredientes.component';

// Módulo de drag-drop
import { DragDropComponentsModule } from '../drag-drop/drag-drop.module';

const routes: Routes = [
  {
    path: '',
    component: GameComponent
  }
];

@NgModule({
  declarations: [
    GameComponent,
    PersonajesComponent,
    IngredientesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    DragDropComponentsModule,
    RouterModule.forChild(routes)
  ]
})
export class GameModule { }
