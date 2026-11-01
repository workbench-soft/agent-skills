# Stop words

A control whose label, hint or `content-desc` holds one of these words, or a
word built on one, MUST be skipped. The agent MUST match the start of the word
and ignore case: `Delete all`, `Deleted`, `Удалить` and `удаление` all match.

## Lose data

The agent MUST treat each of these as a stop word:

| Language | Words                                                                                                                                        |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| en       | delete, remove, erase, clear, wipe, reset, discard, trash, bin, purge, empty, drop, overwrite, replace, restore, uninstall, archive, factory |
| ru       | удал, стере, стира, очист, сброс, сбрось, корзин, перезапис, замен, восстанов, архив, выброс                                                 |
| de       | lösch, entfern, leer, zurücksetz, verwerf, papierkorb, überschreib, ersetz, wiederherstell, archivier                                        |
| fr       | supprim, effac, vider, réinitialis, retir, corbeille, écras, remplac, restaur, archiv, jeter                                                 |
| es       | elimin, borr, vaciar, restablec, quitar, papelera, descart, sobrescrib, reemplaz, restaur, archiv                                            |
| zh       | 删除, 移除, 清除, 清空, 重置, 丢弃, 回收站, 覆盖, 替换, 恢复, 归档                                                                           |
| ja       | 削除, 消去, クリア, 消す, リセット, 破棄, ゴミ箱, 上書き, 置き換え, 復元, アーカイブ                                                         |
| ko       | 삭제, 제거, 지우기, 비우기, 초기화, 재설정, 휴지통, 폐기, 덮어쓰기, 바꾸기, 복원, 보관                                                       |
| nb       | slett, fjern, tøm, tilbakestill, forkast, papirkurv, overskriv, erstatt, gjenopprett, arkiver                                                |

## Leave or reach other people

The agent MUST treat each of these as a stop word too:

| Language | Words                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------- |
| en       | sign out, log out, disconnect, unlink, revoke, leave, send, share, invite, post, publish, pay, buy, subscribe |
| ru       | выйти, выход, отключ, отвяз, отозва, покинуть, отправ, поделит, пригласи, опубликов, оплат, купить, подписат  |
| de       | abmelden, trennen, widerruf, verlassen, senden, teilen, einladen, veröffentlich, bezahl, kaufen, abonnier     |
| fr       | déconnex, déconnect, révoqu, quitter, envoy, partag, invit, publi, payer, paiement, achet, abonn              |
| es       | cerrar sesión, desconect, revoc, salir, envi, compart, invit, publicar, pagar, pago, comprar, suscrib         |
| zh       | 退出, 登出, 断开, 撤销授权, 发送, 分享, 邀请, 发布, 支付, 购买, 订阅                                          |
| ja       | ログアウト, サインアウト, 切断, 権限の取り消し, 退出, 送信, 共有, 招待, 投稿, 公開, 支払, 購入, 登録          |
| ko       | 로그아웃, 연결 해제, 철회, 나가기, 보내기, 전송, 공유, 초대, 게시, 결제, 구매, 구독                           |
| nb       | logg ut, koble fra, tilbakekall, forlat, send, del, inviter, publiser, betal, kjøp, abonner                   |

## Icons with no word

- **Bin** a trash can, a bin or a cross on a list row MUST count as a stop
  word.
- **Eraser** an eraser, a broom or a circular arrow next to data MUST count
  as one.
- **Exit** a door with an arrow or a power symbol MUST count as one.
- **Send** a paper plane, a share arrow, a card or a coin MUST count as one.

## Words that stay safe

- **Cancel** `Cancel`, `Отмена`, `Abbrechen`, `Annuler`, `Cancelar`, `取消`,
  `キャンセル`, `취소`, `Avbryt` close a dialog. The agent SHOULD tap them to
  leave one.
- **Clear search** an `X` inside a search field clears only the typed query.
  It MAY be tapped.
- **Both** a label with a safe word and a stop word, such as `Cancel
  subscription`, MUST count as a stop word.
- **Own rows** a stop word control on a row named `E2E` MUST stay skipped.
  The person removes those rows.
