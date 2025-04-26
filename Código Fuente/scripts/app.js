document.addEventListener('DOMContentLoaded', function () {
    const editor = document.querySelector('.editor');
    const palabras = ["int", "double", "for", "while", "if"];
    const regex = new RegExp(`\\b(${palabras.join("|")})\\b`, "g");

    // Función para resaltar palabras clave
    function resaltarPalabrasClave() {
        const caretPosition = getCaretPosition(editor); //Guardar posición actual
        let textoActual = editor.innerText;
        let textoResaltado = textoActual.replace(regex, '<span class="palabra-clave">$1</span>')

        editor.innerHTML = textoResaltado; //Se actualiza el contenido

        // Restaura la posición del cursor
        if (caretPosition !== null) {
            setCaretPosition(editor, caretPosition);
        }
    }

    // Obtener posición actual del cursor
    function getCaretPosition(element) {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return null;

        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        return preCaretRange.toString().length;
    }

    // Establecer posición del cursor
    function setCaretPosition(element, position) {
        // Si la posición es mayor que el texto, coloca el cursor al final
        const textoTotal = element.innerText;
        if (position > textoTotal.length) {
            position = textoTotal.length;
        }

        // Función recursiva para encontrar el nodo y la posición correcta
        function traverseNodes(node, currentPos) {
            if (node.nodeType === Node.TEXT_NODE) {
                if (currentPos + node.length >= position) {
                    const range = document.createRange();
                    const selection = window.getSelection();

                    range.setStart(node, position - currentPos);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    return true;
                }
                return currentPos + node.length;
            } else {
                let currentPosition = currentPos;
                for (let i = 0; i < node.childNodes.length; i++) {
                    const result = traverseNodes(node.childNodes[i], currentPosition);

                    if (result === true) {
                        return true;
                    }

                    if (typeof result === 'number') {
                        currentPosition = result;
                    }
                }
                return currentPosition;
            }
        }

        traverseNodes(element, 0);
    }

    // Manejo especial para la tecla Enter
    editor.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();

            // Guarda la posición actual antes de insertar el salto
            const pos = getCaretPosition(editor);

            // Inserta el salto de línea en el punto del cursor
            document.execCommand('insertText', false, '\n');

            // Aplica el resaltado manteniendo el formato
            setTimeout(() => {
                resaltarPalabrasClave();

                // Establece el cursor justo después del salto de línea recién insertado
                setCaretPosition(editor, pos + 1);
            }, 0);
        }
    });

    // Se valida el texto por cada entrada en "editor"
    editor.addEventListener('input', function () {
        resaltarPalabrasClave();
    });

    // Se maneja el evento de pegar texto
    editor.addEventListener('paste', function (e) {
        e.preventDefault();
        const texto = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, texto);
    });
});