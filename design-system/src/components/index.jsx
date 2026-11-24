import * as core from './core.jsx';
import * as molecules from './molecules.jsx';
import * as charts from './charts.jsx';
import * as diagrams from './diagrams.jsx';
import * as dashboard from './dashboard.jsx';
import * as slides from './slides.jsx';

const api = { ...core, ...molecules, ...charts, ...diagrams, ...dashboard, ...slides };
window.Webtech = Object.assign(window.Webtech || {}, api);
