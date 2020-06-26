(() => {
	const linearCarousel = (el) => {
		const carouselElement = el;
		let carouselItems = el.querySelectorAll(".carousel__item");
		let activeIndex = 0;

		const reAlignCarousel = () => {
			if (carouselItems.length == 0) {
				return;
			}
			Array.prototype.forEach.call(carouselItems, (item) => {
				item.classList.remove(
					"carousel__item-prev",
					"carousel__item-prev-prev",
					"carousel__item-next",
					"carousel__item-next-next",
					"carousel__item--active"
				);
			});

			if (activeIndex === 0) {
				carouselItems[carouselItems.length - 1].classList.add(
					"carousel__item-prev"
				);
				carouselItems[carouselItems.length - 2].classList.add(
					"carousel__item-prev-prev"
				);
				carouselItems[activeIndex + 1].classList.add(
					"carousel__item-next"
				);
				carouselItems[activeIndex + 2].classList.add(
					"carousel__item-next-next"
				);
			} else if (activeIndex === 1) {
				carouselItems[0].classList.add("carousel__item-prev");
				carouselItems[carouselItems.length - 1].classList.add(
					"carousel__item-prev-prev"
				);
				carouselItems[activeIndex + 1].classList.add(
					"carousel__item-next"
				);
				carouselItems[activeIndex + 2].classList.add(
					"carousel__item-next-next"
				);
			} else if (activeIndex === carouselItems.length - 2) {
				carouselItems[activeIndex - 1].classList.add(
					"carousel__item-prev"
				);
				carouselItems[activeIndex - 2].classList.add(
					"carousel__item-prev-prev"
				);
				carouselItems[activeIndex + 1].classList.add(
					"carousel__item-next"
				);
				carouselItems[0].classList.add("carousel__item-next-next");
			} else if (activeIndex === carouselItems.length - 1) {
				carouselItems[activeIndex - 1].classList.add(
					"carousel__item-prev"
				);
				carouselItems[activeIndex - 2].classList.add(
					"carousel__item-prev-prev"
				);
				carouselItems[0].classList.add("carousel__item-next");
				carouselItems[1].classList.add("carousel__item-next-next");
			} else {
				carouselItems[activeIndex - 1].classList.add(
					"carousel__item-prev"
				);
				carouselItems[activeIndex - 2].classList.add(
					"carousel__item-prev-prev"
				);
				carouselItems[activeIndex + 1].classList.add(
					"carousel__item-next"
				);
				carouselItems[activeIndex + 2].classList.add(
					"carousel__item-next-next"
				);
			}
			carouselItems[activeIndex].classList.add("carousel__item--active");
		};

		const cloneElementAndAppendToCarousel = (element) => {
			var clone = element.cloneNode(true);
			carouselElement.appendChild(clone);
		};

		const moveToNextItem = () => {
			if (activeIndex == carouselItems.length - 1) {
				activeIndex = 0;
			} else {
				activeIndex++;
			}
			reAlignCarousel();
		};

		setInterval(moveToNextItem, 2000);

		const moveToPrevItem = () => {
			if (activeIndex == 0) {
				activeIndex = carouselItems.length - 1;
			} else {
				activeIndex--;
			}
			reAlignCarousel();
		};

		const addButtonsToCarousel = () => {
			const prevButtonElement = document.createElement("div");
			prevButtonElement.classList.add("carousel__button-prev");

			const nextButtonElement = document.createElement("div");
			nextButtonElement.classList.add("carousel__button-next");

			prevButtonElement.addEventListener("click", moveToPrevItem);
			nextButtonElement.addEventListener("click", moveToNextItem);

			carouselElement.appendChild(prevButtonElement);
			carouselElement.appendChild(nextButtonElement);
		};

		const bindClickEventForItems = () => {
			carouselElement.addEventListener("click", (e) => {
				const targetElement = e.path.filter(
					(element) =>
						element.classList &&
						element.classList.contains("carousel__item")
				)[0];
				if (!targetElement) return;
				const indexCSSClasses = [
					"carousel__item-next-next",
					"carousel__item-next",
					"carousel__item-prev",
					"carousel__item-prev-prev",
				];
				const indexCSSClass = indexCSSClasses.filter((cssClass) =>
					targetElement.classList.contains(cssClass)
				)[0];
				switch (indexCSSClass) {
					case "carousel__item-next-next":
					case "carousel__item-next":
						moveToNextItem();
						break;
					case "carousel__item-prev-prev":
					case "carousel__item-prev":
						moveToPrevItem();
				}
			});
		};

		const initializeCarousel = () => {
			switch (carouselItems.length) {
				case 0:
					return;
				case 1:
					cloneElementAndAppendToCarousel(carouselItems[0]);
					cloneElementAndAppendToCarousel(carouselItems[0]);
					cloneElementAndAppendToCarousel(carouselItems[0]);
					cloneElementAndAppendToCarousel(carouselItems[0]);
					break;
				case 2:
					cloneElementAndAppendToCarousel(carouselItems[0]);
					cloneElementAndAppendToCarousel(carouselItems[1]);
					cloneElementAndAppendToCarousel(carouselItems[0]);
					break;
				case 3:
					cloneElementAndAppendToCarousel(carouselItems[0]);
					cloneElementAndAppendToCarousel(carouselItems[1]);
					break;
				case 4:
					cloneElementAndAppendToCarousel(carouselItems[0]);
					break;
			}
			carouselItems = el.querySelectorAll(".carousel__item");
			reAlignCarousel();

			addButtonsToCarousel();

			bindClickEventForItems();
		};
		initializeCarousel();
	};
	linearCarousel(document.querySelector(".horizontal-carousel"));
})();
