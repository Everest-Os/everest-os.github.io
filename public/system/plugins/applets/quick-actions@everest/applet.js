const Applet = imports.ui.applet;

class QuickActionsApplet extends Applet.IconApplet {
  constructor(metadata, orientation, panelHeight, instanceId) {
    super(metadata, orientation, panelHeight, instanceId);
    
    this.set_applet_icon_name('utilities,⚡');
    this.set_applet_tooltip("Quick Actions");
  }

  on_applet_clicked(event) {
    document.documentElement.classList.toggle('compact-ui');
    alert('Compact touch UI toggled');
  }
}

function main(metadata, orientation, panelHeight, instanceId) {
  return new QuickActionsApplet(metadata, orientation, panelHeight, instanceId);
}
