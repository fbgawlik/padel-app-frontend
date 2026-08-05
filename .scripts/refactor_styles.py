import os
import re
from pathlib import Path

root = Path(os.getcwd()) / 'src' / 'screens'

root_keys = {
    'BuscadorClubesScreen.jsx': 'contenedor',
    'ClasesScreen.jsx': 'contenedor',
    'CrearClaseScreen.jsx': 'contenedor',
    'CrearTorneoScreen.jsx': 'container',
    'DashboardScreen.jsx': 'contenedorPadre',
    'GestionComplejo.jsx': 'contenedorBase',
    'GestionTorneoScreen.jsx': 'screenContainer',
    'LoginScreen.jsx': 'contenedor',
    'MisReservasScreen.jsx': 'pantallaContainer',
    'PerfilPublicoScreen.jsx': 'contenedorBase',
    'PerfilScreen.jsx': 'container',
    'RankingScreen.jsx': 'contenedor',
    'RegisterScreen.jsx': 'contenedor',
    'ReservarTurnoScreen.jsx': 'contenedor',
    'TiendaScreen.jsx': 'contenedor',
    'TorneoDetalleScreen.jsx': 'screenContainer',
    'TorneoInscripcionScreen.jsx': 'screenContainer',
    'TorneosScreen.jsx': 'screenContainer',
}

replacements = [
    (r"['\"]#39FF14['\"]", 'theme.colors.primary'),
    (r"['\"]#00ff66['\"]", 'theme.colors.primary'),
    (r"['\"]#00FF66['\"]", 'theme.colors.primary'),
    (r"['\"]#00E5FF['\"]", 'theme.colors.secondaryGlow'),
    (r"['\"]#0A0A0B['\"]", 'theme.colors.background'),
    (r"['\"]#0A0A0A['\"]", 'theme.colors.background'),
    (r"['\"]#050505['\"]", 'theme.colors.background'),
    (r"['\"]#0C0C0E['\"]", 'theme.colors.background'),
    (r"['\"]#141414['\"]", 'theme.colors.cardBg'),
    (r"['\"]rgba\(18, 18, 20, 0\.82\)['\"]", 'theme.colors.cardBg'),
    (r"['\"]#ffffff['\"]", 'theme.colors.text'),
    (r"['\"]#FFFFFF['\"]", 'theme.colors.text'),
]

for filepath in sorted(root.glob('*.jsx')):
    fname = filepath.name
    if fname not in root_keys:
        continue
    text = filepath.read_text(encoding='utf8')
    start = text.rfind('const styles = {')
    if start == -1:
        print(f'{fname}: no styles block found')
        continue
    depth = 0
    end = None
    for i, ch in enumerate(text[start:], start):
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    if end is None:
        print(f'{fname}: unmatched braces')
        continue
    style_block = text[start:end]
    style_content = style_block[len('const styles = '):].strip()
    style_file = filepath.with_name(f'{filepath.stem}.styles.js')

    for pattern, repl in replacements:
        style_content = re.sub(pattern, repl, style_content)

    # Add paddingBottom to root container style
    root_name = root_keys[fname]
    pattern = rf'(\b{re.escape(root_name)}\b\s*:\s*\{{\s*\n)'
    repl = rf"\1    paddingBottom: theme.spacing.bottomNavPadding,\n"
    style_content, count = re.subn(pattern, repl, style_content)
    if count == 0:
        print(f'{fname}: failed to inject paddingBottom into root style {root_name}')

    # Remove minHeight in root style only
    root_pattern = rf'({re.escape(root_name)}\s*:\s*\{{)([\s\S]*?)(\n\s*}})'
    def remove_min_height(match):
        block = match.group(2)
        block = re.sub(r"\n\s*minHeight\s*:\s*['\"]100(?:dvh|vh)['\"],?", '', block)
        return match.group(1) + block + match.group(3)
    style_content = re.sub(root_pattern, remove_min_height, style_content)

    # build style file text
    style_file_text = "import { theme } from '../theme';\n\nexport const styles = " + style_content + "\n"
    style_file.write_text(style_file_text, encoding='utf8')

    # Update JSX file: remove style block and add import line
    before = text[:start].rstrip()
    after = text[end:].lstrip()
    import_stmt = f"import {{ styles }} from './{filepath.stem}.styles';\n"
    imports = list(re.finditer(r'^import .+\n', text, re.MULTILINE))
    if imports:
        insert_pos = imports[-1].end()
        new_text = text[:insert_pos] + import_stmt + text[insert_pos:]
    else:
        new_text = import_stmt + '\n' + text
    # avoid duplicate if it already existed
    if import_stmt in text:
        new_text = text
    # remove style block
    new_text = new_text.replace(style_block, '', 1)
    filepath.write_text(new_text, encoding='utf8')
    print(f'{fname}: extracted styles to {style_file.name}')
