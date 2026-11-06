import { Component, SimpleChanges } from '@angular/core';
import { ManagementBaseComponent } from '../../core/components/management-base/management-base.component';
import { FeatureDescription } from './feature-description.interface';
import { Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MediaService } from '../../core/services/media.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-feature-description',
  imports: [AsyncPipe],
  templateUrl: './feature-description.component.html',
  styleUrl: './feature-description.component.scss'
})
export class FeatureDescriptionComponent extends ManagementBaseComponent<FeatureDescription> {

  constructor(private _mediaService: MediaService) { super(); }

  imageUrl: Observable<string> | undefined;

  ngOnInit() {
    this._tableName = 'feature_description';
    this._sortConfiguration = { orderBy: 'title', order: 'ASC' };
    this._loadItems();
    this._formInputsConfiguration = {
      title: {
        type: 'text',
        alias: 'Title',
        value: '',
        validators: [Validators.required],
        order: 0
      },
      description: {
        type: 'textarea',
        alias: 'Description',
        value: '',
        validators: [Validators.required],
        order: 1
      },
      fileName: {
        type: 'file',
        alias: 'Image',
        value: '',
        validators: [Validators.required],
        order: 2
      }
    }

    setTimeout(() => {
      this.imageUrl = this._mediaService.getFileUrl(this._items[0].fileName);
    }, 500);
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['_isEditing']?.currentValue === true) {
      if (this._items.length > 0) {
        this._editItem(this._items[0]);
      }
      else {
        this._addItem();
      }
    }
  }

  onEditFeature() {
    this._editItem(this._items[0]);
  }

  onAddFeature() {
    this._addItem();
  }


}
