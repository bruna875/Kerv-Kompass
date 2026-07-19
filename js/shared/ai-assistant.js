// ai-assistant.js — Gigi AI slide-in chat panel

(function() {
  // ── State ────────────────────────────────────────────────────────────────────
  var _aiOpen      = false;
  var _aiStreaming  = false;
  var _aiMessages  = [];   // { role: 'user'|'assistant', content: string }
  var _aiToken     = null; // JWT from app.js

  // ── Init ─────────────────────────────────────────────────────────────────────

  function aiInit() {
    _injectStyles();
    _buildPanel();
    _buildToggleBtn();

    // Grab JWT token from app.js global when available
    var tries = 0;
    var poll = setInterval(function() {
      if (typeof _kervToken !== 'undefined' && _kervToken) {
        _aiToken = _kervToken;
        clearInterval(poll);
      }
      if (++tries > 40) clearInterval(poll);
    }, 250);
  }

  // ── CSS ──────────────────────────────────────────────────────────────────────

  function _injectStyles() {
    var style = document.createElement('style');
    style.textContent = [
      // Panel
      '#ai-panel{position:fixed;top:0;right:0;height:100vh;width:380px;max-width:100vw;',
      'background:var(--surface);border-left:1px solid var(--border);',
      'display:flex;flex-direction:column;z-index:8000;',
      'transform:translateX(100%);transition:transform .28s cubic-bezier(.4,0,.2,1);',
      'box-shadow:-4px 0 32px rgba(0,0,0,.10)}',

      '#ai-panel.ai-open{transform:translateX(0)}',

      // Backdrop
      '#ai-backdrop{position:fixed;inset:0;z-index:7999;background:rgba(0,0,0,0);',
      'pointer-events:none;transition:background .28s}',
      '#ai-backdrop.ai-open{background:rgba(0,0,0,.18);pointer-events:auto}',

      // Header
      '#ai-header{display:flex;align-items:center;justify-content:space-between;',
      'padding:16px 18px;border-bottom:1px solid var(--border);flex-shrink:0}',
      '#ai-header-left{display:flex;align-items:center;gap:10px}',
      '#ai-header-icon{width:30px;height:30px;border-radius:8px;',
      'background:linear-gradient(135deg,var(--accent) 0%,#a855f7 100%);',
      'display:flex;align-items:center;justify-content:center;flex-shrink:0}',
      '#ai-title{font-size:14px;font-weight:600;color:var(--text);letter-spacing:-.2px}',
      '#ai-subtitle{font-size:11px;color:var(--muted);margin-top:1px}',
      '#ai-close{width:28px;height:28px;border:1px solid var(--border-md);border-radius:7px;',
      'background:none;cursor:pointer;color:var(--muted);display:flex;align-items:center;',
      'justify-content:center;transition:all .15s;flex-shrink:0}',
      '#ai-close:hover{border-color:var(--accent);color:var(--accent)}',


      // Messages
      '#ai-messages{flex:1;overflow-y:auto;padding:16px 18px;display:flex;',
      'flex-direction:column;gap:14px;scroll-behavior:smooth}',

      // Welcome
      '#ai-welcome{text-align:center;padding:24px 16px}',
      '#ai-welcome-icon{width:48px;height:48px;border-radius:12px;margin:0 auto 12px;',
      'background:linear-gradient(135deg,var(--accent) 0%,#a855f7 100%);',
      'display:flex;align-items:center;justify-content:center}',
      '#ai-welcome h3{font-size:15px;font-weight:600;color:var(--text);margin:0 0 6px}',
      '#ai-welcome p{font-size:12px;color:var(--muted);margin:0;line-height:1.6}',

      // Suggestions
      '#ai-suggestions{display:flex;flex-direction:column;gap:6px;margin-top:16px}',
      '.ai-suggestion{text-align:left;padding:8px 12px;font-size:12px;color:var(--text);',
      'background:var(--bg);border:1px solid var(--border-md);border-radius:8px;',
      'cursor:pointer;font-family:inherit;transition:all .15s;line-height:1.4}',
      '.ai-suggestion:hover{border-color:var(--accent);color:var(--accent);background:rgba(237,0,94,.04)}',

      // Bubbles
      '.ai-msg{display:flex;flex-direction:column;gap:4px;max-width:100%}',
      '.ai-msg-user{align-items:flex-end}',
      '.ai-msg-assistant{align-items:flex-start}',
      '.ai-bubble{padding:10px 13px;border-radius:12px;font-size:13px;line-height:1.6;',
      'max-width:92%;word-wrap:break-word;white-space:pre-wrap}',
      '.ai-bubble-user{background:var(--accent);color:#fff;border-bottom-right-radius:4px}',
      '.ai-bubble-assistant{background:var(--bg);border:1px solid var(--border);',
      'color:var(--text);border-bottom-left-radius:4px}',

      // Markdown in assistant bubbles
      '.ai-bubble-assistant strong{font-weight:600}',
      '.ai-bubble-assistant ul,.ai-bubble-assistant ol{margin:6px 0;padding-left:18px}',
      '.ai-bubble-assistant li{margin-bottom:2px}',
      '.ai-bubble-assistant h1,.ai-bubble-assistant h2,.ai-bubble-assistant h3{',
      'font-size:13px;font-weight:600;margin:8px 0 4px}',
      '.ai-bubble-assistant code{font-family:monospace;font-size:11px;',
      'background:var(--border);border-radius:3px;padding:1px 4px}',

      // Cursor
      '.ai-cursor{display:inline-block;width:2px;height:14px;background:var(--accent);',
      'border-radius:1px;margin-left:2px;animation:ai-blink .8s step-end infinite;vertical-align:middle}',
      '@keyframes ai-blink{0%,100%{opacity:1}50%{opacity:0}}',

      // Thinking indicator
      '.ai-thinking{display:flex;align-items:center;gap:5px;padding:10px 13px;',
      'background:var(--bg);border:1px solid var(--border);border-radius:12px;',
      'border-bottom-left-radius:4px;width:fit-content}',
      '.ai-dot{width:6px;height:6px;border-radius:50%;background:var(--muted);',
      'animation:ai-dot-pulse 1.2s ease-in-out infinite}',
      '.ai-dot:nth-child(2){animation-delay:.2s}',
      '.ai-dot:nth-child(3){animation-delay:.4s}',
      '@keyframes ai-dot-pulse{0%,80%,100%{transform:scale(.7);opacity:.5}40%{transform:scale(1);opacity:1}}',

      // Input area
      '#ai-input-area{padding:14px 18px;border-top:1px solid var(--border);flex-shrink:0}',
      '#ai-input-row{display:flex;align-items:flex-end;gap:8px}',
      '#ai-input{flex:1;resize:none;min-height:38px;max-height:120px;padding:9px 12px;',
      'font-size:13px;font-family:inherit;color:var(--text);background:var(--bg);',
      'border:1px solid var(--border-md);border-radius:10px;outline:none;',
      'transition:border-color .15s;line-height:1.5;overflow-y:auto}',
      '#ai-input:focus{border-color:var(--accent)}',
      '#ai-input::placeholder{color:var(--faint)}',
      '#ai-send{width:36px;height:36px;border-radius:9px;border:none;flex-shrink:0;',
      'background:var(--accent);color:#fff;cursor:pointer;display:flex;align-items:center;',
      'justify-content:center;transition:opacity .15s;align-self:flex-end}',
      '#ai-send:hover:not(:disabled){opacity:.85}',
      '#ai-send:disabled{opacity:.4;cursor:not-allowed}',
      '#ai-hint{font-size:10px;color:var(--faint);margin-top:6px;text-align:center}',

      // Toggle button (topbar)
      '#ai-toggle{width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;',
      'border:1px solid transparent;border-radius:8px;',
      'background:linear-gradient(var(--surface),var(--surface)) padding-box,linear-gradient(135deg,#6366f1,#ec4899) border-box;',
      'cursor:pointer;transition:box-shadow .15s;flex-shrink:0;position:relative}',
      '#ai-toggle:hover{box-shadow:0 0 0 3px rgba(99,102,241,.15),0 0 0 3px rgba(236,72,153,.1);}',
      '#ai-toggle.ai-active{background:linear-gradient(135deg,#6366f1,#ec4899);border-color:transparent;}',
    ].join('');
    document.head.appendChild(style);
  }

  // ── Build panel ──────────────────────────────────────────────────────────────

  function _buildPanel() {
    // Backdrop
    var backdrop = document.createElement('div');
    backdrop.id = 'ai-backdrop';
    backdrop.onclick = aiClosePanel;
    document.body.appendChild(backdrop);

    // Panel
    var panel = document.createElement('div');
    panel.id = 'ai-panel';
    panel.innerHTML = _panelHTML();
    document.body.appendChild(panel);

    // Input event listeners
    var input = document.getElementById('ai-input');
    if (input) {
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); aiSend(); }
      });
      input.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        document.getElementById('ai-send').disabled = !this.value.trim() || _aiStreaming;
      });
    }
  }

  function _panelHTML() {
    return ''
      + '<div id="ai-header">'
      +   '<div id="ai-header-left">'
      +     '<div id="ai-header-icon">' + _sparkleIcon(16, '#fff') + '</div>'
      +     '<div><div id="ai-title">Gigi AI</div><div id="ai-subtitle">Platform assistant</div></div>'
      +   '</div>'
      +   '<button id="ai-close" onclick="aiClosePanel()" title="Close">'
      +     '<svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
      +   '</button>'
      + '</div>'
      + '<div id="ai-messages"><div id="ai-welcome">'
      +   '<div id="ai-welcome-icon">' + _sparkleIcon(22, '#fff') + '</div>'
      +   '<h3>Hi! I\'m Gigi AI</h3>'
      +   '<p>Ask me anything about the company — product, revenue, finance, people, or operations.</p>'
      +   '<div id="ai-suggestions">'
      +     _suggestion('📬 Summarize all pending product requests')
      +     _suggestion('🚦 Which initiatives are behind schedule?')
      +     _suggestion('💡 How many requests are pending?')
      +     _suggestion('👥 What\'s the team capacity this Q?')
      +   '</div>'
      + '</div></div>'
      + '<div id="ai-input-area">'
      +   '<div id="ai-input-row">'
      +     '<textarea id="ai-input" placeholder="Ask anything…" rows="1"></textarea>'
      +     '<button id="ai-send" disabled onclick="aiSend()">'
      +       '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      +     '</button>'
      +   '</div>'
      +   '<div id="ai-hint">↵ send · Shift+↵ new line</div>'
      + '</div>';
  }

  function _suggestion(text) {
    var safe = text.replace(/'/g, "\\'");
    return '<button class="ai-suggestion" onclick="aiSendText(\'' + safe + '\')">' + text + '</button>';
  }

  // ── Toggle button in topbar ──────────────────────────────────────────────────

  function _buildToggleBtn() {
    var tries = 0;
    var poll = setInterval(function() {
      var adminWrap = document.querySelector('.topbar .tb-admin-wrap');
      if (adminWrap) {
        // Wrap gear + divider + AI button in a single flex row
        var wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex;align-items:center;gap:6px;flex-shrink:0';
        adminWrap.parentNode.insertBefore(wrapper, adminWrap);

        // AI button first (left)
        var btn = document.createElement('button');
        btn.id = 'ai-toggle';
        btn.title = 'Gigi AI';
        btn.onclick = aiTogglePanel;
        btn.innerHTML = _sparkleIcon(15, 'gradient');
        wrapper.appendChild(btn);

        // Divider
        var divider = document.createElement('div');
        divider.style.cssText = 'width:1px;height:16px;background:var(--border-md);flex-shrink:0';
        wrapper.appendChild(divider);

        // Gear last (right)
        wrapper.appendChild(adminWrap);

        clearInterval(poll);
      }
      if (++tries > 40) clearInterval(poll);
    }, 150);
  }

  // ── Panel open/close ─────────────────────────────────────────────────────────

  window.aiTogglePanel = function() {
    if (_aiOpen) aiClosePanel(); else aiOpenPanel();
  };

  window.aiOpenPanel = function() {
    _aiOpen = true;
    var panel    = document.getElementById('ai-panel');
    var backdrop = document.getElementById('ai-backdrop');
    var toggleBtn= document.getElementById('ai-toggle');
    if (panel)    panel.classList.add('ai-open');
    if (backdrop) backdrop.classList.add('ai-open');
    if (toggleBtn)toggleBtn.classList.add('ai-active');

    // Update context badge

    // Focus input
    setTimeout(function() {
      var input = document.getElementById('ai-input');
      if (input) input.focus();
    }, 280);
  };

  window.aiClosePanel = function() {
    _aiOpen = false;
    var panel    = document.getElementById('ai-panel');
    var backdrop = document.getElementById('ai-backdrop');
    var toggleBtn= document.getElementById('ai-toggle');
    if (panel)    panel.classList.remove('ai-open');
    if (backdrop) backdrop.classList.remove('ai-open');
    if (toggleBtn)toggleBtn.classList.remove('ai-active');
  };


  // ── Send message ─────────────────────────────────────────────────────────────

  window.aiSendText = function(text) {
    var input = document.getElementById('ai-input');
    if (input) { input.value = text; input.style.height = 'auto'; }
    aiSend();
  };

  window.aiSend = function() {
    var input = document.getElementById('ai-input');
    if (!input) return;
    var text = (input.value || '').trim();
    if (!text || _aiStreaming) return;

    // Clear welcome screen on first message
    var welcome = document.getElementById('ai-welcome');
    if (welcome) welcome.remove();

    // Add user message
    _aiMessages.push({ role: 'user', content: text });
    _appendBubble('user', text);

    // Reset input
    input.value = '';
    input.style.height = 'auto';
    document.getElementById('ai-send').disabled = true;

    // Stream response
    _streamResponse();
  };

  // ── Render bubbles ───────────────────────────────────────────────────────────

  function _appendBubble(role, content) {
    var msgs = document.getElementById('ai-messages');
    if (!msgs) return null;

    var wrap = document.createElement('div');
    wrap.className = 'ai-msg ai-msg-' + role;

    var bubble = document.createElement('div');
    bubble.className = 'ai-bubble ai-bubble-' + role;

    if (role === 'assistant') {
      bubble.innerHTML = _renderMarkdown(content);
    } else {
      bubble.textContent = content;
    }

    wrap.appendChild(bubble);
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
    return bubble;
  }

  function _appendThinking() {
    var msgs = document.getElementById('ai-messages');
    if (!msgs) return null;
    var wrap = document.createElement('div');
    wrap.id = 'ai-thinking-wrap';
    wrap.className = 'ai-msg ai-msg-assistant';
    wrap.innerHTML = '<div class="ai-thinking"><div class="ai-dot"></div><div class="ai-dot"></div><div class="ai-dot"></div></div>';
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
    return wrap;
  }

  // ── Streaming ────────────────────────────────────────────────────────────────

  function _streamResponse() {
    _aiStreaming = true;

    var thinking = _appendThinking();
    var token = _aiToken || (typeof _kervToken !== 'undefined' ? _kervToken : '');
    var pageId = window._kervCurrentPageId || '';

    fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ messages: _aiMessages, pageId: pageId })
    })
    .then(function(res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);

      // Remove thinking indicator, create assistant bubble
      if (thinking && thinking.parentNode) thinking.remove();
      var bubble = _appendBubble('assistant', '');
      bubble.innerHTML = '<span class="ai-cursor"></span>';

      var reader  = res.body.getReader();
      var decoder = new TextDecoder();
      var full    = '';
      var buffer  = '';

      function read() {
        reader.read().then(function(result) {
          if (result.done) {
            _onStreamDone(bubble, full);
            return;
          }
          buffer += decoder.decode(result.value, { stream: true });
          var lines = buffer.split('\n');
          buffer = lines.pop(); // keep incomplete line

          lines.forEach(function(line) {
            if (!line.startsWith('data: ')) return;
            var payload = line.slice(6);
            if (payload === '[DONE]') return;
            try {
              var parsed = JSON.parse(payload);
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.text) {
                full += parsed.text;
                bubble.innerHTML = _renderMarkdown(full) + '<span class="ai-cursor"></span>';
                var msgs = document.getElementById('ai-messages');
                if (msgs) msgs.scrollTop = msgs.scrollHeight;
              }
            } catch (e) { /* ignore parse errors */ }
          });
          read();
        }).catch(function(e) { _onStreamError(bubble, e); });
      }
      read();
    })
    .catch(function(e) {
      if (thinking && thinking.parentNode) thinking.remove();
      _onStreamError(null, e);
    });
  }

  function _onStreamDone(bubble, text) {
    _aiStreaming = false;
    if (bubble) {
      var cursor = bubble.querySelector('.ai-cursor');
      if (cursor) cursor.remove();
      bubble.innerHTML = _renderMarkdown(text || '…');
    }
    _aiMessages.push({ role: 'assistant', content: text });
    var input = document.getElementById('ai-input');
    if (input) {
      input.disabled = false;
      input.focus();
      document.getElementById('ai-send').disabled = !input.value.trim();
    }
  }

  function _onStreamError(bubble, err) {
    _aiStreaming = false;
    var msg = 'Errore: ' + (err.message || 'Qualcosa è andato storto.');
    if (bubble) {
      bubble.textContent = msg;
      bubble.style.color = '#EF4444';
      var cursor = bubble.querySelector('.ai-cursor');
      if (cursor) cursor.remove();
    } else {
      _appendBubble('assistant', msg);
    }
    var input = document.getElementById('ai-input');
    if (input) { input.disabled = false; document.getElementById('ai-send').disabled = false; }
  }

  // ── Simple markdown renderer ─────────────────────────────────────────────────

  function _renderMarkdown(text) {
    if (!text) return '';
    var escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return escaped
      // Code blocks
      .replace(/```[\s\S]*?```/g, function(m) {
        return '<code>' + m.slice(3, -3).trim() + '</code>';
      })
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Headers
      .replace(/^### (.+)$/gm, '<strong>$1</strong>')
      .replace(/^## (.+)$/gm,  '<strong>$1</strong>')
      .replace(/^# (.+)$/gm,   '<strong>$1</strong>')
      // Bullet lists
      .replace(/^[•\-\*] (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, function(m) { return '<ul>' + m + '</ul>'; })
      // Numbered lists
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      // Newlines
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  }

  // ── SVG icons ────────────────────────────────────────────────────────────────

  // gradient = true → indigo-to-pink gradient stroke (topbar button)
  // color = '#fff'   → white stroke (panel header icons on gradient bg)
  // neither           → inherits currentColor
  function _sparkleIcon(size, color) {
    var isGradient = (color === 'gradient');
    var isWhite    = (color === '#fff');

    if (isGradient) {
      var uid = 'ai-sg-' + size;
      return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'
        + '<defs><linearGradient id="' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">'
        + '<stop offset="0%" stop-color="#6366F1"/><stop offset="100%" stop-color="#ED005E"/>'
        + '</linearGradient></defs>'
        + '<path d="M12 3l1.88 5.76a2 2 0 0 0 1.36 1.36L21 12l-5.76 1.88a2 2 0 0 0-1.36 1.36L12 21l-1.88-5.76a2 2 0 0 0-1.36-1.36L3 12l5.76-1.88a2 2 0 0 0 1.36-1.36L12 3z" stroke="url(#' + uid + ')"/>'
        + '<path d="M5 3v4M3 5h4M19 17v4M17 19h4" stroke="url(#' + uid + ')"/>'
        + '</svg>';
    }

    var colorStyle = isWhite ? ' style="color:#fff"' : '';
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"' + colorStyle + '>'
      + '<path d="M12 3l1.88 5.76a2 2 0 0 0 1.36 1.36L21 12l-5.76 1.88a2 2 0 0 0-1.36 1.36L12 21l-1.88-5.76a2 2 0 0 0-1.36-1.36L3 12l5.76-1.88a2 2 0 0 0 1.36-1.36L12 3z"/>'
      + '<path d="M5 3v4M3 5h4M19 17v4M17 19h4"/>'
      + '</svg>';
  }

  // ── Boot ─────────────────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', aiInit);
  } else {
    aiInit();
  }

})();
