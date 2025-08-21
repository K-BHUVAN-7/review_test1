import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";

@Component({
  selector: 'app-webcam',
  templateUrl: './webcam.component.html',
  styleUrl: './webcam.component.scss'
})
export class WebcamComponent {
  WIDTH = 640;
  HEIGHT = 380;

  @ViewChild("video") public video!: ElementRef;


  @ViewChild("canvas") public canvas!: ElementRef;


  captures: string[] = [];
  error: any;
  isCaptured: boolean = false;

  async ngAfterViewInit() {
    await this.setupDevices();
  }

  async setupDevices() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
        if (stream) {
          this.video.nativeElement.srcObject = stream;
          this.video.nativeElement.play();
          this.error = null;
        } else {
          this.error = "You have no output video device";
        }
      } catch (e) {
        this.error = e;
      }
    }
  }

  capture() {
    this.drawImageToCanvas(this.video.nativeElement);
    this.captures.push(this.canvas.nativeElement.toDataURL("image/png"));
    this.isCaptured = true;
  }

  removeCurrent() {
    this.isCaptured = false;
  }

  setPhoto(idx: number) {
    this.isCaptured = true;
    var image = new Image();
    image.src = this.captures[idx];
    this.drawImageToCanvas(image);
  }

  drawImageToCanvas(image: any) {
    this.canvas.nativeElement
      .getContext("2d")
      .drawImage(image, 0, 0, this.WIDTH, this.HEIGHT);
  }

  submit() {
    if (!this.isCaptured || this.captures.length == 0) {
      console.error("No image captured!");
      return;
    }
  
    // Construct payload
    const payload = {
      timestamp: new Date().toISOString(),
      imageData: this.captures[this.captures.length - 1], // Latest captured image
    };
  
    console.log("Submitting payload:", payload);
  
    // Example: Send the payload to an API
    this.sendToServer(payload);
  }
  
  // Example function to send data to a backend
  sendToServer(payload: any) {
    // Here you can integrate an HTTP request to send the data
    // Example using Angular HttpClient (make sure to inject HttpClient in the constructor)
    // this.http.post('YOUR_BACKEND_ENDPOINT', payload).subscribe(response => {
    //   console.log('Server Response:', response);
    // }, error => {
    //   console.error('Error submitting data:', error);
    // });
  
    console.log("Payload would be sent to the server:", payload);
  }
  




}