import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  AlertController,
  LoadingController,
  NavController,
} from "@ionic/angular";
import { Subscription } from "rxjs";
import { Place } from "../../place.model";
import { PlacesService } from "../../places.service";

@Component({
  selector: "app-edit-offer",
  templateUrl: "./edit-offer.page.html",
  styleUrls: ["./edit-offer.page.scss"],
})
export class EditOfferPage implements OnInit, OnDestroy {
  form: FormGroup;
  place: Place;
  placeId: string;
  isLoading = false;
  private placeSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private placesService: PlacesService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}
  ngOnInit() {
    this.route.paramMap.subscribe(
      (paramMap) => {
        if (!paramMap.has("placeId")) {
          this.navCtrl.navigateBack("/places/tabs/offers");
          return;
        }
        this.placeId = paramMap.get("placeId");
        this.isLoading = true;
        this.placeSub = this.placesService
          .getPlace(paramMap.get("placeId"))
          .subscribe((place) => {
            this.place = place;
            this.form = new FormGroup({
              title: new FormControl(this.place.title, {
                updateOn: "blur",
                validators: [Validators.required],
              }),
              description: new FormControl(this.place.description, {
                updateOn: "blur",
                validators: [Validators.required, Validators.maxLength(180)],
              }),
              // add prices here
              price: new FormControl(this.place.price, {
                updateOn: "blur",
                validators: [Validators.required],
              }),
            });
            this.isLoading = false;
          });
      },
      (error) => {
        this.alertCtrl
          .create({
            header: "An error occured",
            message: "Place could not be fetched. Please try again later.",
            buttons: [
              {
                text: "Okay",
                handler: () => {
                  this.router.navigate(["/places/tabs/offers"]);
                },
              },
            ],
          })
          .then((alertEl) => {
            alertEl.present();
          });
      }
    );
  }

  onUpdateOffer() {
    if (!this.form.valid) {
      return;
    }
    this.loadingCtrl
      .create({
        message: "Updating place...",
      })
      .then((loadingEl) => {
        loadingEl.present();
        this.placesService
          .updatePlace(
            this.place.id,
            this.form.value.title,
            this.form.value.description,
            this.form.value.price
          )
          .subscribe(() => {
            loadingEl.dismiss();
            this.form.reset();
            this.router.navigate(["/places/tabs/offers"]);
          });
      });
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}
