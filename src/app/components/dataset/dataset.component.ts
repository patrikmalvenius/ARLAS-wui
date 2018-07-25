import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ArlasBookmarkService } from 'arlas-wui-toolkit/services/bookmark/bookmark.service';
import { BookmarkDataSource } from 'arlas-wui-toolkit/services/bookmark/bookmarkDataSource';
import { BookMark } from '../../../../node_modules/arlas-wui-toolkit/services/bookmark/model';

@Component({
  selector: 'arlas-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.css']
})
export class DatasetComponent implements OnInit {
  @Input() public icon: string;
  @Input() public nbTopBookmarks: number;
  public datasets: BookmarkDataSource;
  public topBookmarks: Array<BookMark>;

  constructor(
    public dialog: MatDialog,
    private bookmarkService: ArlasBookmarkService
  ) { }

  public ngOnInit(): void {
    this.icon = this.icon ? this.icon : 'view_modules';
    this.nbTopBookmarks = this.nbTopBookmarks ? this.nbTopBookmarks : 3;

    this.bookmarkService.dataBase.dataChange.subscribe(bookmarks => {
      const sortedBookmark = bookmarks.sort((a, b) => {
        return (a.views < b.views ? -1 : 1) * (-1);
      });
      this.topBookmarks = sortedBookmark.slice(0, this.nbTopBookmarks);
    });
  }

  public openDialog() {
    this.dialog.open(DatasetDialogComponent, { width: '45vw' });
  }

  public openDialogAdd() {
    const dialogRef = this.dialog.open(DatasetAddDialogComponent, { data: { name: null } });
    dialogRef.afterClosed().subscribe(bookmarkName => {
      if (bookmarkName) {
        this.bookmarkService.addBookmark(bookmarkName);
      }
    });
  }

  public viewBookmark(id) {
    this.bookmarkService.viewBookMark(id);
  }

}

@Component({
  selector: 'arlas-dataset-dialog',
  templateUrl: './dataset-dialog.component.html',
  styleUrls: ['./dataset-dialog.component.css']
})
export class DatasetDialogComponent {

  public datasets: BookmarkDataSource;
  public columnsToDisplay = ['checked', 'name', 'date', 'count', 'actions'];
  public itemsCheck: Array<string> = new Array<string>();
  public disableCombine = true;


  constructor(
    public dialog: MatDialog,
    private bookmarkService: ArlasBookmarkService,
    public dialogRef: MatDialogRef<DatasetDialogComponent>
  ) {
    this.datasets = new BookmarkDataSource(this.bookmarkService.dataBase);

  }

  public selectDataset(event, id) {
    if (event.checked) {
      this.itemsCheck.push(id);
    } else {
      const index = this.itemsCheck.indexOf(id, 0);
      if (index > -1) {
        this.itemsCheck.splice(index, 1);
      }
    }
    if (this.itemsCheck.length < 2) {
      this.disableCombine = true;
    } else {
      const sameColor = this.itemsCheck.map(i => this.bookmarkService.bookMarkMap.get(i).color).reduce((a, b) => {
        return (a === b) ? a : 'false';
      });
      this.disableCombine = (sameColor === 'false');
    }
  }

  public viewBookmark(url) {
    this.bookmarkService.viewBookMark(url);
    this.dialogRef.close();
  }

  public removeBookmark(id) {
    this.bookmarkService.removeBookmark(id);
    this.selectDataset({ event: { checked: false } }, id);
  }

  public combine() {
    const dialogRef = this.dialog.open(DatasetAddDialogComponent, { data: { name: null } });
    dialogRef.afterClosed().subscribe(bookmarkName => {
      if (bookmarkName) {
        this.bookmarkService.createCombineBookmark(bookmarkName, new Set(this.itemsCheck));
      }
    });
  }

  public viewCombine() {
    this.bookmarkService.viewCombineBookmark(new Set(this.itemsCheck));
    this.itemsCheck = new Array<string>();
    this.disableCombine = true;
  }
}

@Component({
  selector: 'arlas-dataset-add-dialog',
  templateUrl: './dataset-add-dialog.component.html',
  styleUrls: ['./dataset-add-dialog.component.css']
})
export class DatasetAddDialogComponent {
  public bookmarkName: string;

  constructor(
    public dialogRef: MatDialogRef<DatasetAddDialogComponent>) { }

  public cancel(): void {
    this.dialogRef.close();
  }
}
