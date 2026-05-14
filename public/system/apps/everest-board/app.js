export async function launch(ctx) {
  const { windowManager, vfs, appLoader } = ctx;
  const BOARDS_DIR = '/home/user/Documents/Boards';

  // Ensure boards directory exists
  try {
    await vfs.mkdir('/home/user/Documents');
    await vfs.mkdir(BOARDS_DIR);
  } catch (e) {
    // Ignore if already exists
  }

  let activeBoard = null;
  let activeBoardFile = null;
  let boardsList = [];

  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;height:100%;background:var(--bg-primary);color:var(--text-primary);font-family:var(--font-main);';

  // Sidebar
  const sidebar = document.createElement('div');
  sidebar.style.cssText = 'width:220px;background:var(--bg-card);border-right:1px solid var(--border);display:flex;flex-direction:column;';
  
  const sidebarHeader = document.createElement('div');
  sidebarHeader.style.cssText = 'padding:16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;';
  sidebarHeader.innerHTML = '<span style="font-weight:600;font-size:14px;">My Boards</span>';
  
  const newBoardBtn = document.createElement('button');
  newBoardBtn.className = 'btn-primary btn-sm';
  newBoardBtn.textContent = '+ New';
  newBoardBtn.onclick = () => {
    window.osAPI.showSystemDialog({
      title: 'New Board',
      message: 'Enter a name for the new board:',
      type: 'prompt',
      onConfirm: async (name) => {
        if (!name) return;
        const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
        const boardPath = `${BOARDS_DIR}/${safeName}.json`;
        const initialData = {
          name,
          columns: [
            { id: 'col-1', title: 'To Do', cards: [] },
            { id: 'col-2', title: 'In Progress', cards: [] },
            { id: 'col-3', title: 'Done', cards: [] }
          ]
        };
        await vfs.writeFile(boardPath, JSON.stringify(initialData, null, 2));
        await loadBoardsList();
        await openBoard(boardPath);
      }
    });
  };
  sidebarHeader.appendChild(newBoardBtn);

  const boardsContainer = document.createElement('div');
  boardsContainer.style.cssText = 'flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:4px;';

  sidebar.append(sidebarHeader, boardsContainer);

  // Main Area
  const main = document.createElement('div');
  main.style.cssText = 'flex:1;display:flex;flex-direction:column;overflow:hidden;background:var(--bg-surface);';
  
  const mainHeader = document.createElement('div');
  mainHeader.style.cssText = 'height:56px;padding:0 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;background:var(--bg-elevated);';
  const boardTitle = document.createElement('h2');
  boardTitle.style.cssText = 'margin:0;font-size:18px;font-weight:600;';
  
  const boardActions = document.createElement('div');
  const deleteBoardBtn = document.createElement('button');
  deleteBoardBtn.className = 'btn-danger btn-sm';
  deleteBoardBtn.textContent = 'Delete Board';
  deleteBoardBtn.style.display = 'none';
  deleteBoardBtn.onclick = () => {
    window.osAPI.showSystemDialog({
      title: 'Delete Board',
      message: 'Delete this board permanently?',
      type: 'confirm',
      onConfirm: async () => {
        await vfs.rm(activeBoardFile);
        activeBoard = null;
        activeBoardFile = null;
        renderBoard();
        await loadBoardsList();
      }
    });
  };
  boardActions.appendChild(deleteBoardBtn);
  mainHeader.append(boardTitle, boardActions);

  const boardCanvas = document.createElement('div');
  boardCanvas.style.cssText = 'flex:1;overflow-x:auto;padding:20px;display:flex;gap:16px;align-items:flex-start;';

  main.append(mainHeader, boardCanvas);
  wrap.append(sidebar, main);

  // Drag state
  let draggingCard = null;
  let sourceColId = null;

  async function loadBoardsList() {
    boardsContainer.innerHTML = '';
    try {
      const items = await vfs.readdir(BOARDS_DIR);
      boardsList = items.filter(i => i.name.endsWith('.json'));
      
      if (boardsList.length === 0) {
        boardsContainer.innerHTML = '<div style="font-size:12px;color:var(--text-tertiary);text-align:center;padding:20px;">No boards yet.</div>';
      }

      for (const file of boardsList) {
        const btn = document.createElement('div');
        btn.style.cssText = `
          padding: 10px 12px; border-radius: 8px; cursor: pointer; font-size: 13px;
          transition: background 0.2s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        `;
        const path = file.path;
        
        // Read just enough to get name (or use filename)
        let name = file.name.replace('.json', '');
        try {
          const content = await vfs.readFile(path);
          const data = JSON.parse(content);
          if (data.name) name = data.name;
        } catch(e){}

        btn.textContent = name;
        if (activeBoardFile === path) {
          btn.style.background = 'rgba(var(--accent-rgb), 0.15)';
          btn.style.color = 'var(--accent)';
          btn.style.fontWeight = '600';
        } else {
          btn.onmouseover = () => btn.style.background = 'var(--bg-surface-hover)';
          btn.onmouseout = () => btn.style.background = 'transparent';
        }
        btn.onclick = () => openBoard(path);
        boardsContainer.appendChild(btn);
      }
    } catch (e) {
      console.error("Failed to load boards", e);
    }
  }

  async function openBoard(path) {
    try {
      const content = await vfs.readFile(path);
      activeBoard = JSON.parse(content);
      activeBoardFile = path;
      deleteBoardBtn.style.display = 'block';
      loadBoardsList(); // to update active state
      renderBoard();
    } catch(e) {
      window.osAPI.showSystemDialog({
        title: 'Error',
        message: "Failed to read board: " + e.message,
        type: 'alert'
      });
    }
  }

  async function saveActiveBoard() {
    if (!activeBoard || !activeBoardFile) return;
    await vfs.writeFile(activeBoardFile, JSON.stringify(activeBoard, null, 2));
  }

  function renderBoard() {
    boardCanvas.innerHTML = '';
    if (!activeBoard) {
      boardTitle.textContent = 'Select a Board';
      deleteBoardBtn.style.display = 'none';
      return;
    }

    boardTitle.textContent = activeBoard.name;

    activeBoard.columns.forEach(col => {
      const colEl = document.createElement('div');
      colEl.style.cssText = 'background:var(--bg-card);border:1px solid var(--border);border-radius:12px;min-width:280px;max-width:280px;display:flex;flex-direction:column;max-height:100%;box-shadow:var(--shadow-sm);';
      
      const colHeader = document.createElement('div');
      colHeader.style.cssText = 'padding:14px;font-weight:600;font-size:14px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;';
      colHeader.innerHTML = `<span>${col.title}</span> <span style="font-size:11px;color:var(--text-tertiary);background:var(--bg-elevated);padding:2px 8px;border-radius:12px;">${col.cards.length}</span>`;
      
      const cardsList = document.createElement('div');
      cardsList.style.cssText = 'padding:12px;display:flex;flex-direction:column;gap:10px;overflow-y:auto;flex:1;min-height:50px;';
      
      // Drag & Drop logic for column
      cardsList.ondragover = e => {
        e.preventDefault();
        cardsList.style.background = 'rgba(var(--accent-rgb), 0.05)';
      };
      cardsList.ondragleave = e => {
        cardsList.style.background = 'transparent';
      };
      cardsList.ondrop = async e => {
        e.preventDefault();
        cardsList.style.background = 'transparent';
        if (!draggingCard) return;

        // Remove from old
        const sourceCol = activeBoard.columns.find(c => c.id === sourceColId);
        const cardIndex = sourceCol.cards.findIndex(c => c.id === draggingCard.id);
        if (cardIndex > -1) {
          sourceCol.cards.splice(cardIndex, 1);
        }

        // Add to new
        col.cards.push(draggingCard);
        await saveActiveBoard();
        renderBoard();
      };

      col.cards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.draggable = true;
        cardEl.style.cssText = 'background:var(--bg-primary);border:1px solid var(--border);border-radius:8px;padding:12px;font-size:13px;box-shadow:0 2px 4px rgba(0,0,0,0.05);cursor:grab;position:relative;group;';
        
        const cardText = document.createElement('div');
        cardText.textContent = card.text;
        cardText.style.whiteSpace = 'pre-wrap';
        cardText.style.wordBreak = 'break-word';

        const delBtn = document.createElement('button');
        delBtn.textContent = '×';
        delBtn.style.cssText = 'position:absolute;top:4px;right:4px;background:none;border:none;color:var(--text-tertiary);cursor:pointer;font-size:16px;width:20px;height:20px;display:flex;align-items:center;justify-content:center;border-radius:4px;';
        delBtn.onmouseover = () => { delBtn.style.background = 'var(--bg-surface-hover)'; delBtn.style.color = '#ff4444'; };
        delBtn.onmouseout = () => { delBtn.style.background = 'none'; delBtn.style.color = 'var(--text-tertiary)'; };
        delBtn.onclick = async () => {
          col.cards = col.cards.filter(c => c.id !== card.id);
          await saveActiveBoard();
          renderBoard();
        };

        cardEl.ondragstart = e => {
          draggingCard = card;
          sourceColId = col.id;
          e.dataTransfer.setData('text/plain', card.id);
          setTimeout(() => cardEl.style.opacity = '0.5', 0);
        };
        cardEl.ondragend = () => {
          draggingCard = null;
          sourceColId = null;
          cardEl.style.opacity = '1';
        };
        
        // Double click to edit
        cardEl.ondblclick = () => {
          const input = document.createElement('textarea');
          input.value = card.text;
          input.style.cssText = 'width:100%;min-height:60px;background:var(--bg-input);border:1px solid var(--accent);color:var(--text-primary);border-radius:6px;padding:8px;font-family:inherit;font-size:13px;resize:vertical;outline:none;';
          cardEl.innerHTML = '';
          cardEl.appendChild(input);
          input.focus();
          
          const saveEdit = async () => {
            if (input.value.trim()) {
              card.text = input.value.trim();
              await saveActiveBoard();
            }
            renderBoard();
          };
          input.onblur = saveEdit;
          input.onkeydown = e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(); } };
        };

        cardEl.append(cardText, delBtn);
        cardsList.appendChild(cardEl);
      });

      const addBtn = document.createElement('button');
      addBtn.textContent = '+ Add a card';
      addBtn.style.cssText = 'margin:12px;padding:8px;background:none;border:none;color:var(--text-secondary);text-align:left;cursor:pointer;border-radius:6px;font-size:13px;';
      addBtn.onmouseover = () => addBtn.style.background = 'var(--bg-surface-hover)';
      addBtn.onmouseout = () => addBtn.style.background = 'none';
      
      addBtn.onclick = () => {
        const inputContainer = document.createElement('div');
        inputContainer.style.cssText = 'margin:0 12px 12px 12px;display:flex;flex-direction:column;gap:8px;';
        const input = document.createElement('textarea');
        input.placeholder = 'Enter a title for this card...';
        input.style.cssText = 'width:100%;min-height:60px;background:var(--bg-primary);border:1px solid var(--accent);color:var(--text-primary);border-radius:8px;padding:10px;font-family:inherit;font-size:13px;resize:vertical;outline:none;box-shadow:var(--shadow-sm);';
        
        const controls = document.createElement('div');
        controls.style.cssText = 'display:flex;gap:8px;';
        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn-primary btn-sm';
        saveBtn.textContent = 'Add Card';
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn-secondary btn-sm';
        cancelBtn.textContent = 'Cancel';
        controls.append(saveBtn, cancelBtn);
        inputContainer.append(input, controls);

        addBtn.replaceWith(inputContainer);
        input.focus();

        const submitCard = async () => {
          if (input.value.trim()) {
            col.cards.push({ id: 'c-' + Date.now(), text: input.value.trim() });
            await saveActiveBoard();
          }
          renderBoard();
        };

        saveBtn.onclick = submitCard;
        cancelBtn.onclick = renderBoard;
        input.onkeydown = e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitCard(); } };
      };

      colEl.append(colHeader, cardsList, addBtn);
      boardCanvas.appendChild(colEl);
    });
  }

  // Initial setup
  await loadBoardsList();
  if (boardsList.length > 0) {
    await openBoard(boardsList[0].path);
  }

  ctx.windowManager.createWindow({
    id: 'everest-board',
    title: 'Everest Board',
    width: 950,
    height: 600,
    content: wrap,
    icon: 'board,📋'
  });
}
