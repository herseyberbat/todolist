
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- FormsModule'ü import ettik
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { trigger, transition, style, animate } from '@angular/animations'; // Animasyonlar için importlar

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'Pending' | 'Completed';
  createdDate: Date;
  dueDate?: Date;
}

@Component({
  selector: 'app-todo',
  standalone: true,
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css'],
  imports: [
    CommonModule,
    FormsModule,  // <-- Burada FormsModule'ü ekledik
    DialogModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    InputTextareaModule
  ],
  animations: [
    trigger('overlayContentAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class TodoComponent {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  newTask: Partial<Task> = {};
  isPopupVisible = false;
  isFilterPopupVisible = false;
  deletePopupVisible = false;
  taskToDelete: Task | null = null;

  currentFilter: 'all' | 'completed' = 'all';
  currentSort: 'earliest' | 'latest' | null = null;

  dropdownOptions = [
    { label: 'Görev Ekle', value: 'addTask' },
    { label: 'Filtrele', value: 'filter' }
  ];
  selectedOption: string | null = null;

  ngOnInit() {
    this.loadTasksFromLocalStorage();
    this.filteredTasks = [...this.tasks];
  }

  addTask() {
    const today = new Date();
    const dueDate = this.newTask.dueDate ? new Date(this.newTask.dueDate) : null;

    if (!this.newTask.title || !this.newTask.description || !dueDate) {
      alert('Lütfen tüm alanları doldurun!');
      return;
    }

    if (dueDate < today) {
      alert('Geçmiş bir tarih seçilemez!');
      return;
    }

    const task: Task = {
      id: this.tasks.length + 1,
      title: this.newTask.title!,
      description: this.newTask.description!,
      status: 'Pending',
      createdDate: new Date(),
      dueDate: dueDate,
    };
    this.tasks.push(task);
    this.saveTasksToLocalStorage();
    this.applyFiltersAndSorting();
    this.newTask = {};
  }

  toggleStatus(task: Task) {
    task.status = task.status === 'Pending' ? 'Completed' : 'Pending';
    this.saveTasksToLocalStorage();
    this.applyFiltersAndSorting();
  }

  confirmDeleteTask(task: Task) {
    this.deletePopupVisible = true;
    this.taskToDelete = task;
  }

  closeDeletePopup() {
    this.deletePopupVisible = false;
    this.taskToDelete = null;
  }

  deleteTask() {
    if (this.taskToDelete) {
      this.tasks = this.tasks.filter((t) => t.id !== this.taskToDelete!.id);
      this.saveTasksToLocalStorage();
      this.applyFiltersAndSorting();
      this.closeDeletePopup();
    }
  }

  filterTasks(filter: 'all' | 'completed') {
    this.currentFilter = filter;
    this.applyFiltersAndSorting();
  }

  sortTasksByDate(order: 'earliest' | 'latest') {
    this.currentSort = order;
    this.applyFiltersAndSorting();
  }

  private applyFiltersAndSorting() {
    let tasks = [...this.tasks];

    if (this.currentFilter === 'completed') {
      tasks = tasks.filter((task) => task.status === 'Completed');
    }

    if (this.currentSort === 'earliest') {
      tasks.sort((a, b) => (a.dueDate ? a.dueDate.getTime() : Infinity) - (b.dueDate ? b.dueDate.getTime() : Infinity));
    } else if (this.currentSort === 'latest') {
      tasks.sort((a, b) => (b.dueDate ? b.dueDate.getTime() : -Infinity) - (a.dueDate ? a.dueDate.getTime() : -Infinity));
    }

    this.filteredTasks = tasks;
  }

  private loadTasksFromLocalStorage() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      this.tasks = JSON.parse(storedTasks).map((task: Task) => ({
        ...task,
        createdDate: new Date(task.createdDate),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      }));
    }
  }

  private saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }
  
}
