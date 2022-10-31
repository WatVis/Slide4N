import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';
import {
  ToolbarButton,
  ICommandPalette,
  MainAreaWidget,
  WidgetTracker,
  ReactWidget
} from '@jupyterlab/apputils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import {
  NotebookPanel,
  INotebookModel,
  NotebookActions
} from '@jupyterlab/notebook';
import { IDisposable, DisposableDelegate } from '@lumino/disposable';
// enable link feature
import {
  INotebookTools,
  INotebookTracker
  // NotebookActions, Notebook, NotebookPanel, INotebookModel
} from '@jupyterlab/notebook';
import { Cell as CellJupyter } from '@jupyterlab/cells';

import * as _ from 'lodash';

import testCells from './data/cells';
import { Cell, convertCells2NBStory, MediaData, MediaType } from './util';
import { NB2SlidesWrapper } from './nb2slides';
import { NB2SlidesStore } from './store/nb2slides';
// import './axios';

/**
 * The plugin registration information.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'nbstory:plugin',
  autoStart: true,
  requires: [
    ICommandPalette,
    ILayoutRestorer,
    INotebookTools,
    INotebookTracker
  ],
  activate: activate
};

/**
 * Activate the extension.
 * @param app
 * @param palette
 * @param restorer
 */
function activate(
  app: JupyterFrontEnd,
  palette: ICommandPalette,
  restorer: ILayoutRestorer,
  notebookTools: INotebookTools
) {
  console.log('Slide4N is on');

  // Declare a widget variable
  let widget: MainAreaWidget<NB2SlidesWrapper>;

  // Add an application command
  const command: string = 'nbstory:open';
  app.commands.addCommand(command, {
    label: 'Slide4N',
    execute: (args: any) => {
      // console.log('args into plugin ', args.origin);

      if (!widget || widget.isDisposed) {
        // Create a new widget if one does not exist
        // or if the previous one was disposed after closing the panel

        // create nbstory widget: when reloading codeoverview will not be drawn
        const content = new NB2SlidesWrapper();

        // inject widget into MainAreaWidget
        widget = new MainAreaWidget({ content });
        widget.id = 'nbstory-jupyterlab';
        widget.title.label = 'Slide4N';
        widget.title.closable = true;

        if (notebookTools.activeNotebookPanel != null) {
          // configure the widget
          const notebookPanel = notebookTools.activeNotebookPanel;

          // get cells from Notebook
          // @ts-ignore
          const cellsFromNB = notebookPanel.model?.toJSON().cells;
          // const cellsFromNB = notebookPanel.content.model?.toJSON().cells;
          // console.log('cellsFromNB', cellsFromNB);
          // convert cells into cells2NB2Slides
          const cells2NB2Slides = convertCells2NBStory(cellsFromNB);
          // console.log('cells2NB2Slides', cells2NB2Slides);
          content.setCells2Store(cells2NB2Slides);

          // get cells from notebook to enable scrollview
          // @ts-ignore
          const cells: Array<CellJupyter> = notebookPanel.content.widgets;
          // console.log('cells', cells);

          // enable navi by index
          const navNBCallback = (index: number) => {
            // active cell
            notebookPanel.content.activeCellIndex = index;
            // scroll into view
            cells[index].node.scrollIntoView({
              behavior: 'smooth'
            });
          };

          // get cell with index: if modified, this will return new contents
          const getNBCell = (index: number) => {
            // @ts-ignore
            return notebookPanel.model?.toJSON().cells[index];
          };

          // set info back to Slide4N
          content.setNavNBCb(navNBCallback);
          content.setGetNBCell(getNBCell);

          // update the React widget
          content.update();

          // track the cell content change
          notebookPanel.model?.contentChanged.connect(sender => {
            // console.log('content change', sender);
            let activeCell = notebookPanel.content.activeCell?.model.toJSON();
            let activeCellIndex = notebookPanel.content.activeCellIndex;

            // console.log('active cell', activeCell);
            content.updateCellDataWhenChanged(activeCell, activeCellIndex);
          });

          // track active cell content change
          notebookPanel.content.activeCellChanged.connect(sender => {
            // console.log('active cell change', sender);

            let activeCell = notebookPanel.content.activeCell?.model.toJSON();
            let activeCellIndex = notebookPanel.content.activeCellIndex;

            // console.log('active cell', activeCell);
            content.updateCellDataWhenChanged(activeCell, activeCellIndex);
          });
        }
      }
      if (!tracker.has(widget)) {
        // Track the state of the widget for later restoration
        tracker.add(widget);
      }
      if (!widget.isAttached) {
        // Attach the widget to the main work area if it's not there
        app.shell.add(widget, 'main');
      }
      widget.content.update();

      // Activate the widget
      app.shell.activateById(widget.id);
    }
  });

  // Add the command to the palette.
  palette.addItem({
    command,
    category: 'Slide4N',
    args: { origin: 'from the palette' }
  });

  // Track and restore the widget state
  let tracker = new WidgetTracker<MainAreaWidget<NB2SlidesWrapper>>({
    namespace: 'nbstory'
  });
  restorer.restore(tracker, {
    command,
    name: () => 'nbstory'
  });
}

/**
 * Export the plugin as default.
 */
export default plugin;
