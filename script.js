$(document).ready(function() {
    GL = document.getElementById("glcanvas");
    picture_width = GL.offsetWidth;
    picture_height = GL.offsetHeight;
    document.getElementById("VARJO").setAttribute("width", picture_width);
    document.getElementById("secondBackground").setAttribute("width", picture_width);
    document.getElementById("block").setAttribute("width", picture_width);

    document.getElementById("secondBackground").play();
});

window.addEventListener('resize', function(event) {
    GL = document.getElementById("glcanvas");
    picture_width = GL.offsetWidth;
    document.getElementById("VARJO").setAttribute("width", picture_width);
    document.getElementById("secondBackground").setAttribute("width", picture_width);
    document.getElementById("block").setAttribute("width", picture_width);


}, true);