// src: https://github.com/JorelAli/mdBook-pagetoc

// Un-active everything when you click it
var pagetoc;

var updateFunction = function() {
    if (!pagetoc) {
        return;
    }

    var id;
    var elements = document.getElementsByClassName("header");
    Array.prototype.forEach.call(elements, function(el) {
        if (window.pageYOffset >= el.offsetTop) {
            id = el;
        }
    });

    Array.prototype.forEach.call(pagetoc.children, function(el) {
        el.classList.remove("active");
    });

    if (!id) {
        return;
    }

    Array.prototype.forEach.call(pagetoc.children, function(el) {
        if (id.href.localeCompare(el.href) == 0) {
            el.classList.remove("active");
            el.classList.add("active");
        }
    });
};

// Populate sidebar on load
window.addEventListener('load', function() {
    pagetoc = document.getElementsByClassName("pagetoc")[0];
    if (!pagetoc) {
        return;
    }
    var elements = document.getElementsByClassName("header");
    Array.prototype.forEach.call(elements, function(el, i) {
        var link = document.createElement("a");

        // Indent shows hierarchy
        var indent = "";
        switch (el.parentElement.tagName) {
            case "H2":
                indent = "20px";
                break;
            case "H3":
                indent = "40px";
                break;
            case "H4":
                indent = "60px";
                break;
            default:
                break;
        }

        link.appendChild(document.createTextNode(el.text));
        link.style.paddingLeft = indent;
        link.href = el.href;
        pagetoc.appendChild(link);
    });
    Array.prototype.forEach.call(pagetoc.children, function(child) {
        child.addEventListener("click", function() {
            Array.prototype.forEach.call(pagetoc.children, function(item) {
                item.classList.remove("active");
            });
            child.classList.add("active");
        });
    });
    updateFunction.call();
});



// Handle active elements on scroll
window.addEventListener("scroll", updateFunction);
