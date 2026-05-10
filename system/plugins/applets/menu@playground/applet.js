const Applet = imports.ui.applet;

function main(metadata, orientation, panel_height, instance_id) {
  return new MyApplet(metadata, orientation, panel_height, instance_id);
}

class MyApplet extends Applet.TextIconApplet {
  constructor(metadata, orientation, panel_height, instance_id) {
    super(metadata, orientation, panel_height, instance_id);
    this.set_applet_icon_name('system-run');
    this.set_applet_label("Menu");
    this.set_applet_tooltip("Main Menu");

    // Tell appMenu.js to style this applet as soon as it's loaded
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('reload-menu-settings'));
    }, 100);
  }

  on_applet_clicked(event) {
    window.dispatchEvent(new CustomEvent('everest:toggle-menu'));
  }
}
