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
  @ViewChild('tiltBar') tiltBar: any;
  @ViewChild('image') image: any;
  @ViewChild('tiltBarIndicator') tiltBarIndicator: any;

  averageGamma: any = [];
  maxTilt: number = 20;
  latestTilt: any = 0;
  centerOffset: any;
  tiltCenterOffset: any;
  resizedImageWidth: any;
  aspectRatio: any;
  delta: any;
  height: any;
  width: any;
  tiltBarIndicatorWidth: any;
  tiltBarWidth: any;
  tiltBarPadding: number = 20;

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

    this.delta = this.resizedImageWidth - this.width;
    this.centerOffset = this.delta / 2;

    this.tiltBarWidth = this.width - this.tiltBarPadding;

    this.tiltBarIndicatorWidth = (this.width / this.tiltBarWidth) / this.resizedImageWidth;

    this.renderer.setElementStyle(this.tiltBarIndicator.nativeElement, 'width', this.tiltBarIndicatorWidth + 'px');

    this.tiltCenterOffset = ((this.tiltBarWidth / 2) - (this.tiltBarIndicatorWidth / 2));

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
    this.updateTiltBar(tilt);

  }

  updateTiltImage(pxToMove){
    this.renderer.setElementStyle(this.image.nativeElement, 'transform', 'translate3d(' + pxToMove + 'px,0,0)');
  }

  updateTiltBar(tilt){
    
    let pxToMove = (tilt * ((this.tiltBarWidth - this.tiltBarIndicatorWidth) / 2)) / this.maxTilt;
    let translateX = this.tiltCenterOffset + pxToMove;
    this.renderer.setElementStyle(this.tiltBarIndicator.nativeElement, 'transform', 'translate3d(' + translateX + 'px,0,0)');

  }

}
