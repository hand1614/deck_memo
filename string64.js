
"use strict";

const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_" ;

const log_init = ( new Array( 56 ) ).fill( 0 ) ;

function compress4 ( str, char64 = charset, log0k_init = log_init, log8k_init = log_init ) {
  let   ret   = "" ;
  const log0k = [ ...log0k_init ] ;
  const log8k = [ ...log8k_init ] ;
  for( const v of str ) {
    const n       = v.codePointAt() ;
    const index0k = log0k.indexOf( n ) ;
    const index8k = log8k.indexOf( n & 0x1fff00 ) ;
    ret +=
      index0k !== -1               ? char64[ index0k ]
    : n >> 8  === log0k[ 0 ] >> 8  ? char64[ 0x38 | n & 3 ] + char64[ 0x3f & n >> 2 ]
    : index8k !== -1               ? char64[ 0x3c | n & 3 ] + char64[ 0x3f & n >> 2 ] + char64[ index8k ]
    : n >> 16 === log0k[ 0 ] >> 16 ? char64[ 0x3c | n & 3 ] + char64[ 0x3f & n >> 2 ] + char64[ 0x38 | n >> 8 & 3 ] + char64[ 0x3f & n >> 10 ]
    :                                char64[ 0x3c | n & 3 ] + char64[ 0x3f & n >> 2 ] + char64[ 0x3c | n >> 8 & 3 ] + char64[ 0x3f & n >> 10 ] + char64[ n >> 16 ] ;
    for( let i = ( index8k + 1 || log8k.length ) - 1 ; i > 0 ; i-- ) log8k[ i ] = log8k[ i - 1 ] ;
    log8k[ 0 ] = n & 0x1fff00 ;
    for( let i = ( index0k + 1 || log0k.length ) - 1 ; i > 0 ; i-- ) log0k[ i ] = log0k[ i - 1 ] ;
    log0k[ 0 ] = n ;
  }
  return ret ;
}

function index_to_charcode( target, index ) { return target.charset.indexOf( target.str[ index ] ) ; }

function archive4 ( str, char64 = charset, log0k_init = log_init, log8k_init = log_init ) {
  let   ret    = "" ;
  const log0k  = [ ...log0k_init ] ;
  const log8k  = [ ...log8k_init ] ;
  const code64 = new Proxy( { charset: char64, str: str }, { get: index_to_charcode } ) ;
  for( let i = 0 ; i < str.length ; ) {
    const n =
      code64[ i ]     & 0x38 ^ 0x38 ? log0k[ code64[ i++ ] ]
    : code64[ i ]     & 0x3c ^ 0x3c ? code64[ i++ ] & 3 | code64[ i++ ] << 2 | log8k[ 0 ]
    : code64[ i + 2 ] & 0x38 ^ 0x38 ? code64[ i++ ] & 3 | code64[ i++ ] << 2 | log8k[ code64[ i++ ] ]
    : code64[ i + 2 ] & 0x3c ^ 0x3c ? code64[ i++ ] & 3 | code64[ i++ ] << 2 | ( code64[ i++ ] & 3 ) << 8 | code64[ i++ ] << 10 | log8k[ 0 ] & 0x1f0000
    :                                 code64[ i++ ] & 3 | code64[ i++ ] << 2 | ( code64[ i++ ] & 3 ) << 8 | code64[ i++ ] << 10 | code64[ i++ ] << 16 ;
    for( let j = ( log8k.indexOf( n & 0x1fff00 ) + 1 || log8k.length ) - 1 ; j > 0 ; j-- ) log8k[ j ] = log8k[ j - 1 ] ;
    log8k[ 0 ] = n & 0x1fff00 ;
    for( let j = ( log0k.indexOf( n ) + 1 || log0k.length ) - 1 ; j > 0 ; j-- ) log0k[ j ] = log0k[ j - 1 ] ;
    log0k[ 0 ] = n ;
    ret += String.fromCodePoint( n ) ;
  }
  return ret ;
}
