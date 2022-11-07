
var is_mobile = !!navigator.userAgent.match(/iphone|android|blackberry/ig) || false;
$(document).ready(function() {
    GL = document.getElementById("glcanvas");
    if (is_mobile) {
        GL.setAttribute("class", glcanvas_moblie);
        console.log("on moblie")
    } else {console.log("on pc ")}
    picture_width = GL.offsetWidth;
    picture_height = GL.offsetHeight;
    document.getElementById("VARJO").setAttribute("width", picture_width);
    document.getElementById("secondBackground").setAttribute("width", picture_width + 50);
    document.getElementById("thirdBackground").setAttribute("width", picture_width + 50);
    document.getElementById("block").setAttribute("width", picture_width);
    
    document.getElementById("source_img").setAttribute("heigh", picture_height);
    document.getElementById("source_img").setAttribute("width", picture_width);

    document.getElementById("secondBackground").play();
    document.getElementById("secondBackground").play();

});

window.addEventListener('resize', function(event) {
    GL = document.getElementById("glcanvas");
    picture_width = GL.offsetWidth;
    document.getElementById("VARJO").setAttribute("width", picture_width);
    document.getElementById("secondBackground").setAttribute("width", picture_width + 50);
    document.getElementById("thirdBackground").setAttribute("width", picture_width + 50);

    document.getElementById("source_img").setAttribute("width", picture_width);
    document.getElementById("source_img").setAttribute("heigh", picture_height);

    document.getElementById("block").setAttribute("width", picture_width);


}, true);