function share(title,url) {
    navigator.share({title: title, text: "Check this out", url: url});
}