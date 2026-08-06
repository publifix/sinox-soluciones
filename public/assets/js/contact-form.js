(function () {
  var form = document.querySelector('[data-contact-form]');
  if (!form) return;

  // The success message sits as a sibling of <form>, not a descendant --
  // hiding the form (display:none) would hide a nested success message too.
  var successEl = form.parentElement.querySelector('[data-contact-success]');

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    form.hidden = true;
    if (successEl) successEl.hidden = false;
  });
})();
