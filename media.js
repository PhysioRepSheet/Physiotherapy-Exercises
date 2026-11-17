/*
  YOUR OWN EXERCISE PHOTOS AND VIDEOS
  ===================================
  This list is written for you by the "Add photos and videos" page (media.html).
  You don't need to edit it by hand, but you can.

  For each exercise (by its id from exercises.js):
    image   A photo in the images/exercises folder. It is shown instead of the moving drawing.
    video   A video in the videos folder. A little "Picture | Video" switch then appears.

  Anything set here wins over the image and video fields in exercises.js.
*/
window.REPSHEET_MEDIA = {};
// ---- end of list ----

(function () {
  var media = window.REPSHEET_MEDIA || {};
  (window.EXERCISES || []).forEach(function (ex) {
    var m = media[ex.id];
    if (!m) return;
    if (m.image) ex.image = m.image;
    if (m.video) ex.video = m.video;
  });
})();
