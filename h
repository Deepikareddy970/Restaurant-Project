[33mcommit 338d7206e8516f4f9fce9f875b503b6f2f74ef65[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmain[m[33m)[m
Author: Deepikareddy970 <manideepikareddy305@gmail.com>
Date:   Fri Aug 7 22:16:54 2026 +0530

    Fix scrolling in Order Online and Celebration Packages modals, scope selectors, and add empty state placeholders

 backend/data/emails.log                    |   9 [32m+[m
 backend/server.js                          |   3 [32m+[m[31m-[m
 backend/test_menu_parse.js                 |  75 [32m+++[m
 frontend/dist/assets/index-B2sQSl-_.js     |  88 [31m---[m
 frontend/dist/assets/index-B2sQSl-_.js.map |   1 [31m-[m
 frontend/dist/assets/index-BSuxXnRL.css    |   1 [32m+[m
 frontend/dist/assets/index-BeP2olRQ.js     | 119 [32m++++[m
 frontend/dist/assets/index-BeP2olRQ.js.map |   1 [32m+[m
 frontend/dist/assets/index-ofE4__rP.css    |   1 [31m-[m
 frontend/dist/index.html                   | 709 [32m++++++++++++++++++++++[m[31m--[m
 frontend/index.html                        | 705 [32m+++++++++++++++++++++[m[31m--[m
 frontend/src/main.js                       | 863 [32m++++++++++++++++++++++++++++[m[31m-[m
 frontend/src/styles/components.css         | 194 [32m++++++[m[31m-[m
 13 files changed, 2600 insertions(+), 169 deletions(-)
