(function () {
  /* ---- Generic pointer drag-to-scroll, same fixed implementation as
     service-page.js: pointer capture is only claimed past a small movement
     threshold, so a plain click/tap on the track never gets its click event
     retargeted to the track container. ---- */
  function enableDragScroll(track) {
    if (!track) return;
    var DRAG_THRESHOLD = 6;
    var isDown = false;
    var dragging = false;
    var startX = 0;
    var startScroll = 0;
    var pointerId = null;

    track.addEventListener('pointerdown', function (event) {
      if (event.pointerType !== 'mouse') return;
      isDown = true;
      dragging = false;
      startX = event.clientX;
      startScroll = track.scrollLeft;
      pointerId = event.pointerId;
    });

    track.addEventListener('pointermove', function (event) {
      if (!isDown) return;
      var delta = event.clientX - startX;
      if (!dragging && Math.abs(delta) > DRAG_THRESHOLD) {
        dragging = true;
        track.classList.add('is-dragging');
        track.setPointerCapture(pointerId);
      }
      if (dragging) {
        track.scrollLeft = startScroll - delta;
      }
    });

    function endDrag() {
      if (!isDown) return;
      isDown = false;
      if (dragging) {
        track.classList.remove('is-dragging');
        if (track.hasPointerCapture(pointerId)) {
          track.releasePointerCapture(pointerId);
        }
      }
      dragging = false;
    }

    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('pointerleave', endDrag);
  }

  enableDragScroll(document.querySelector('[data-timeline-track]'));
})();
