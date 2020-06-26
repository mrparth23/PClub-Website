const logo = document.querySelectorAll("#logo path");

for (let i = 0; i < logo.length; i++) {
	console.log(`Letter ${i} is ${logo[i].getTotalLength()}`);
}

const navMenu = document.querySelector(".nav-menu");
const navToggler = navMenu.children[0];
navToggler.addEventListener("click", () => {
	navMenu.classList.toggle("nav-open");
});
$(function () {
	$(document).ready(function () {
		var $nav = $(".header");
		$nav.toggleClass("scrolled", $(this).scrollTop() > $nav.height());
	});
	$(document).scroll(function () {
		var $nav = $(".header");
		$nav.toggleClass("scrolled", $(this).scrollTop() > $nav.height());
	});
});
