/************************************************************************
 * 
 * Search V2
 * 
 * ----------------------------------------------------------------------
 * Parameters
 * 
 * String: string to search
 * 
 * Separator: use of a specific character to separate the elements of an array. 
 *            Returns the elements found separated from the same separator.
 *            (Search for example in a 'Joined List').
 * 
 * Escape characters: replaces the characters with a space, allows searches 
 *                    to be insensitive to certain characters 
 *                    (such as for example city names with a '-')
 * 
 * Search: search criteria, either a list of words (complete or partial) to search, 
 *         or a word or an expression between "" for an exact search
 * 
 * Uppercase: uppercase Sensitive.
 *            (1 : active, 0 : inactive (default))
 * 
 * Ignore Accent: ignore accents in the search.
 *                (1 : active, 0 : inactive (default))
 * 
 * Word: searches only whole words
 *       (1 : active, 0 : inactive (default))
 * 
 * ------------------------------------------------------------------------
 * Remarks
 * Spaces at the beginning and at the end are automatically removed.
 * The order of words in the search does not matter.
 * 
 **************************************************************************/

let cacheAnd = new Map();
let cacheOr = new Map();

window.function = function (st, sep, esc, search, upper, accent, word) {

  if (st.value == undefined || st.value == '') return undefined;
  if (search.value == undefined || search.value == '') return undefined;

  st = st.value ?? "";
  sep = sep.value ?? "";
  esc = esc.value ?? "";
  search = search.value ?? "";
  upper = upper.value ?? 0;
  accent = accent.value ?? 0;
  word = word.value ?? 0;

  let ret = st;

  // Delete Space
  st = st.trim();
  search = search.trim();

  if (search == '' || st == '')
    return '';

  // st Ignore Accent
  if (accent) {
    st = st.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  // st uppercase sensitive
  if (!upper) {
    st = st.toLowerCase();
  }

  // Escape
  if (esc.includes(sep) && sep != '')
  {
    throw("ERROR Manu.n, The separator character is included in the Escape characters");
  }

  esc = reEscape(esc);
  let reEsc = new RegExp(esc, "g");   
  if (esc)
  {
    st = st.replace(reEsc,' ');
  }

  // Cache
  let key = sep + esc + search + upper + accent + word;
  let critAnd = cacheAnd.get(key);
  let critOr = cacheOr.get(key);

  // Search Params
  if (critAnd === undefined && critOr === undefined) {

    critAnd = [];
    critOr = [];
    
    // st Ignore Accent
    if (accent) {
      search = search.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    // st uppercase sensitive
    if (!upper) {
      search = search.toLowerCase();
    }

    // Escape
    if (esc)
    {
      search = search.replace(reEsc,' ');
    }

    // word
    let w = "";
    if (word)
      w = "\\b";

    // Split '"Text with" red color' : ['', 'Test with', '', 'red', 'color']
    let s = search.split(/ (?=(?:[^"]*"[^"]*")*[^"]*$)|"/);

    let tag = 0;
    for (let i = 0; i < s.length; i++) {

      if (tag > 0 && s[i] != '') {
        //critAnd.push("(?=(.*?(" + w + s[i] + w + ")[^$]*))");
        critAnd.push("(?=.*?(" + w + s[i] + w + ")[^$]*)");
        tag = 2;
      }

      if (s[i] == '') {
        if (tag == 2)
          tag = 0;
        else
          tag = 1;
      }

      if (tag == 0 && s[i] != '') {
        critOr.push('(' + w + s[i] + w + ')');
      }
    }

    cacheAnd.set(key, critAnd);
    cacheOr.set(key, critOr);
  }

  // check if separator -> array
  if (sep != '')
  {
    let stS = st.split(sep);
    let retS = ret.split(sep);
    let results = [];

    for (let i=0; i< stS.length; i++)
    {
      let x = findSearch(stS[i], retS[i],critAnd, critOr)
      if (x != '')
      {
        results.push(x);
      }
    }
    return results.join(sep);

  }
  else
  {
    return findSearch(st,ret,critAnd,critOr);
  }
  
}

function findSearch (st,ret,critAnd,critOr)
{
  // Find ?
  if (critAnd.length > 0) {
    if (new RegExp(critAnd.join('')).test(st)) {
      return ret;
    }
  }
  else {

    if (RegExp(critOr.join('|')).test(st))
      return ret;
  }
  return '';
}

// Ajoute un échappement '\' aux caractères spéciaux
function reEscape(s) {
    return s.replace(/([.*+?^$|(){}\[\]])/mg, "\\$1");
}