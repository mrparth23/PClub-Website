const carouselSlide = document.querySelector(".carousel-slide");
const carouselImages = carouselSlide.children;

let counter = 1;
const size = -100 / carouselImages.length;

carouselSlide.style.transform = "translateX(" + size * counter + "%)";

setInterval(nextImage, 3000);

function nextImage() {
	if (counter >= 4) return;
	carouselSlide.style.transition = "transform 0.3s ease-in-out";
	counter++;
	carouselSlide.style.transform = "translateX(" + size * counter + "%)";
}

carouselSlide.addEventListener("transitionend", () => {
	if (carouselImages[counter].id == "cloneFirst") {
		counter = 1;
		carouselSlide.style.transition = "none";
		console.log("none");
		carouselSlide.style.transform = "translateX(" + size * counter + "%)";
	} else if (carouselImages[counter].id == "cloneLast") {
		counter = carouselImages.length - 2;
		carouselSlide.style.transition = "none";
		console.log("none");
		carouselSlide.style.transform = "translateX(" + size * counter + "%)";
	}
});
