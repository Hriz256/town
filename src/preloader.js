BABYLON.DefaultLoadingScreen.prototype.displayLoadingUI = () => {
    document.getElementById('loader').style.display = "block";
};

BABYLON.DefaultLoadingScreen.prototype.hideLoadingUI = () => {
    document.getElementById('loader').style.display = "none";
};
