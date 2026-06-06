/**
 * FormService — construye el deep-link al Google Form de picks,
 * pre-rellenando el nombre del participante.
 *
 * Nota: el frontend también puede construir esta URL; se deja esta
 * función backend por si se quiere centralizar o ampliar el prefill
 * (titular/suplente) cuando se conozcan sus entry IDs.
 */
var FormService = (function () {

  function buildPrefillUrl(participantName) {
    var name = String(participantName || '').trim();
    var url = APP.FORM_BASE_URL + '?usp=pp_url';
    if (name) {
      // Google Forms usa '+' para espacios en prefill.
      var encoded = encodeURIComponent(name).replace(/%20/g, '+');
      url += '&' + APP.FORM_PARTICIPANT_ENTRY + '=' + encoded;
    }
    return url;
  }

  return { buildPrefillUrl: buildPrefillUrl };
})();

/** Wrapper invocable desde el cliente si se requiere. */
function getFormUrl(participantName) {
  return FormService.buildPrefillUrl(participantName);
}
