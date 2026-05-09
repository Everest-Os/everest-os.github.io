const Desklet = imports.ui.desklet;

class ClockDesklet extends Desklet.Desklet {
    constructor(metadata, desklet_id) {
        super(metadata, desklet_id);

        this._container = document.createElement('div');
        this._container.style.padding = '24px 32px';
        this._container.style.background = 'var(--bg-card)';
        this._container.style.border = '1px solid var(--border)';
        this._container.style.borderRadius = '16px';
        this._container.style.boxShadow = 'var(--shadow-xl)';
        this._container.style.textAlign = 'center';
        this._container.style.backdropFilter = 'blur(10px)';
        this._container.style.WebkitBackdropFilter = 'blur(10px)';
        
        this.timeLabel = document.createElement('div');
        this.timeLabel.style.fontSize = '48px';
        this.timeLabel.style.fontWeight = '800';
        this.timeLabel.style.color = 'var(--text-primary)';
        this.timeLabel.style.lineHeight = '1.1';
        this.timeLabel.style.marginBottom = '8px';
        
        this.dateLabel = document.createElement('div');
        this.dateLabel.style.fontSize = '16px';
        this.dateLabel.style.fontWeight = '500';
        this.dateLabel.style.color = 'var(--text-secondary)';
        
        this._container.appendChild(this.timeLabel);
        this._container.appendChild(this.dateLabel);

        this.setContent({ _element: this._container });

        this._updateTime();
        this._timer = setInterval(() => this._updateTime(), 1000);
    }

    _updateTime() {
        const now = new Date();
        this.timeLabel.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.dateLabel.textContent = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    on_desklet_removed() {
        if (this._timer) clearInterval(this._timer);
    }
}

function main(metadata, desklet_id) {
    return new ClockDesklet(metadata, desklet_id);
}
