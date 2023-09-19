import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { AgGridModule } from 'ag-grid-angular';

@Component({
  selector: 'app-ag-grid-temp',
  templateUrl: './ag-grid-temp.component.html',
  styleUrls: ['./ag-grid-temp.component.scss'],
  standalone: true,
  imports: [AgGridModule]
})
export class AgGridTempComponent implements OnChanges {
  @Input() gridOptions;

  ngOnChanges(changes: SimpleChanges): void {
    console.log('666666', changes)
  }
}
