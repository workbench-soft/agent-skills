---
name: translations
description: 'Use before adding or changing any text a person sees in an app, site or tool: labels, buttons, errors, notifications, store listings, emails. Also on "translate", "add a language", "check the translations", "переведи", "добавь перевод". Each string goes through the repo''s i18n into every shipped language in the same change, in each catalog''s tone. Native and server text maps to keys. A test keeps the catalogs in sync.'
---

# Every string in every language

A person MUST see each string in the language the app shows. One English line
in a Russian screen reads as a bug, so each change MUST carry every language
it touches.

## 1. Find the setup

The agent MUST find the repo's catalogs and the languages it ships before the
first edit.

- **Languages** an app of the workbench-soft org MUST ship 9: `en` first,
  then `ru`, `de`, `fr`, `es`, `zh`, `ja`, `ko` and `nb`. Another repo MUST
  keep the set it already has.
- **Language pick** the app MUST follow the phone or browser language, and
  Settings MUST let the person pick another one.
- **No i18n yet** a repo with text and no catalogs MUST get the setup for its
  stack first, as one change, before any feature.

Each stack MUST use the tool in its row:

| Code              | Tool                                                     |
| ----------------- | -------------------------------------------------------- |
| TypeScript, React | i18next with react-i18next, a catalog per language       |
| Expo              | the same, with expo-localization for the device language |
| Kotlin, Android   | string resources in `values-<lang>/strings.xml`          |
| Swift             | a String Catalog, `Localizable.xcstrings`                |
| Rust              | `rust-i18n`                                              |
| VS Code extension | `vscode.l10n` and `package.nls.<lang>.json`              |

In TypeScript, `en.ts` MUST type the keys, as in `tickalot/src/i18n`, so a
missing key fails `tsc`.

## 2. Add or change a string

The agent MUST take these steps for each string a person sees:

1. The agent MUST put the text under a key in the English catalog, grouped by
   the screen or the feature that shows it.
2. The agent MUST add the same key to every other catalog in the same commit.
   A key with English text in another catalog MUST NOT ship.
3. The agent MUST read 5 nearby lines of each catalog first and match their
   tone: formal or casual address, the words for the app's own controls.
4. The code MUST read the text with `t('key')` or the stack's twin. A string
   literal a person sees MUST NOT sit in the code.
5. A changed English text MUST change its translations in the same commit.

- **Placeholders** each catalog MUST keep every `{{name}}` of the English
  text, spelled the same.
- **Plurals** a count MUST use the stack's plural forms. Russian MUST get
  `one`, `few` and `many`.
- **Names** the app name, brand names and units such as `ISO` MAY stay as
  they are.
- **Length** a translation SHOULD fit the space the English uses. German and
  French run about 30% longer, so a tight button SHOULD get a short word.

## 3. Text from outside the catalogs

An error from native code, a server or a library arrives in English. The UI
MUST NOT show that text to the person.

- **Code first** native code and servers SHOULD send a stable code, such as
  `E_BUSY`, and the UI MUST pick the key from the code.
- **Known texts** where only English text arrives, a pure function MUST map
  each known text to a key, with a test beside it. Shuttrix does this in
  `apps/shuttrix/src/camera/error-reason.ts` of `memories`.
- **Unknown text** the mapper MUST fall back to a translated "Something went
  wrong. Try again." The raw text SHOULD go to the log for debugging.
- **New native error** a change that adds an error text to native code MUST
  add its mapping and its keys in the same change.

## 4. Check before the commit

The agent MUST run these checks before it commits:

- **Same keys** a test MUST compare the keys of every catalog with the
  English one. A repo without that test MUST get it.
- **Hard-coded text** the agent MUST search the changed files for string
  literals a person sees, such as `Alert.alert('`, `>Text<` or `title: '`.
  Each hit MUST move to a key.
- **On screen** a change to a visible screen SHOULD get one look in a second
  language, such as Russian, to catch cut words and English left over.

The agent MAY use this search as a start:

```bash
rg -n "Alert\.alert\('|>[A-Z][a-z]+[^<{]*<|(title|label|placeholder): '[A-Z]" src --glob '!**/i18n/**' --glob '!*.test.*'
```

## 5. Translate a whole catalog

A new language or a catalog with gaps MUST get every key at once. The agent
MUST translate from the English catalog and keep the key order. A translation
SHOULD read like an app made in that language.
