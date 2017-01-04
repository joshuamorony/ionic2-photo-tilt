import { Component, Input, ViewChild, Renderer } from '@angular/core';
import { Platform, DomController } from 'ionic-angular'

@Component({
  selector: 'photo-tilt',
  templateUrl: 'photo-tilt.html',
  host: {
    '(window:deviceorientation)': 'onDeviceOrientation($event)',
    '(window:resize)': 'initTilt()'
  }
})
export class PhotoTiltComponent {

  @Input('tiltImage') tiltImage: any;
  @Input('tiltHeight') tiltHeight: any;

  @ViewChild('mask') mask: any;
  @ViewChild('image') image: any;

  averageGamma: any = [];
  maxTilt: number = 20;
  latestTilt: any = 0;
  centerOffset: any;
  resizedImageWidth: any;
  aspectRatio: any;
  delta: any;
  height: any;
  width: any;

  constructor(public platform: Platform, public domCtrl: DomController, public renderer: Renderer) {

  }

  initTilt(){

      this.height = this.tiltHeight || this.platform.height();
      this.width = this.platform.width();

      this.aspectRatio = this.image.nativeElement.width / this.image.nativeElement.height;
      this.renderTilt();

  }

  renderTilt(){

    this.image.nativeElement.height = this.height;

    this.resizedImageWidth = this.aspectRatio * this.image.nativeElement.height;
    this.renderer.setElementStyle(this.image.nativeElement, 'width', this.resizedImageWidth + 'px');

    this.delta = this.resizedImageWidth - this.width;
    this.centerOffset = this.delta / 2;

    this.updatePosition();

  }

  onDeviceOrientation(ev){

    if(this.averageGamma.length > 8){
      this.averageGamma.shift();
    }

    this.averageGamma.push(ev.gamma);

    this.latestTilt = this.averageGamma.reduce((previous, current) => {
      return previous + current;
    }) / this.averageGamma.length;

    this.domCtrl.write(() => {
      this.updatePosition();
    });


  }

  updatePosition(){

    let tilt = this.latestTilt;

    if(tilt > 0){
      tilt = Math.min(tilt, this.maxTilt);
    } else {
      tilt = Math.max(tilt, this.maxTilt * -1);
    }

    let pxToMove = (tilt * this.centerOffset) / this.maxTilt;

    this.updateTiltImage((this.centerOffset + pxToMove) * -1);

  }

  updateTiltImage(pxToMove){
    this.renderer.setElementStyle(this.image.nativeElement, 'transform', 'translate3d(' + pxToMove + 'px,0,0)');
  }

}
