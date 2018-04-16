$(document).ready(function(){
  $.fn.datepicker.defaults.language = 'vi';
  $.fn.editable.defaults.mode = 'inline';
  form_init();
  $('#current_date_time').html(get_current_date_time())
  var price = new AutoNumeric('#price', { currencySymbol : '', decimalPlaces: '0' });
  var quantity = new AutoNumeric('#quantity', { currencySymbol : '', decimalPlaces: '0' });
  var debt_rate = new AutoNumeric('#debt_rate', { currencySymbol : '', decimalPlaces: '5' });
  var gia_danh_muc = new AutoNumeric('#gia_danh_muc', { currencySymbol : '', decimalPlaces: '0' });
  $('.datepicker').on("change", function(){
    if ($("#start_date").val() && $("#end_date").val()){
      $('#diffDays').html(cal_diff_days($("#start_date").val(), $("#end_date").val()))
    }
  })
  var db = initialize_database();

  $('#product_name').on("change", function(e){
    db.products.toArray().then(function(val){
      val.find(function(product){
        if(e.target.value){
          if (product.id == e.target.value){
            price.set(product.price)
            cal_total_val()
          }
        }else {
          $('#price').val("")
        }
      })
    })
    var pdata = $('#product_name').select2('data')
    if (pdata.length > 0){
      $('#product_name_mount').val(pdata[0].text)
    }else {
      $('#product_name_mount').val('')
    }
  })

  $("#detb_table_body").bind('DOMSubtreeModified', function(){
    var tong_goc = 0
    var tong_lai = 0
    var tong_tra = 0
    var tong_thanh_toan = 0
    $('#detb_table_body > tr').each(function(){
      tong_goc += fparse($(this).find('.no_goc').html())
      tong_lai += fparse($(this).find('.tien_lai').html())
      tong_tra += fparse($(this).find('.tra_giua_ky').html())
      tong_thanh_toan = tong_goc + tong_tra + tong_lai
      console.log('tong goc' + tong_goc)
      console.log('tong lai' + tong_lai)
      $('#td_tong_goc').html(tong_goc.formatMoney(0, '.', ','))
      $('#td_tong_lai').html(tong_lai.formatMoney(0, '.', ','))
      $('#td_tong_tra').html(tong_tra.formatMoney(0, '.', ','))
      $('#td_tong_thanhtoan').html(tong_thanh_toan.formatMoney(0, '.', ','))
    })
  })
})

function fparse(val){
  var return_value = parseFloat(remove_all_currency_mark(val))
  if(return_value){
    return return_value
  }else{
    return 0
  }
}

function cal_total_val(){
  var interest_rate = fparse($('#debt_rate').val())
  var diffDays = fparse($('#diffDays').html())
  var price = fparse($('#price').val())
  var dvt = fparse($('#dvt').val())
  var total_debt = fparse($("#price").val()) * fparse($("#dvt").val())
  var quantity = fparse($("#quantity").val())
  var total_quantity =  dvt * quantity
  console.log("lai " + interest_rate.toString())
  console.log("so ngay " + diffDays.toString())
  console.log("gia " + price.toString())
  console.log("dvt " + dvt.toString())
  console.log("sl " + quantity.toString())
  console.log("=============================")
  if( !dvt || !quantity){
    total_quantity = 1
  }
  var no_goc = price * total_quantity
  var tien_lai = (no_goc * interest_rate * diffDays) / 100
  var tong_thanh_toan = no_goc + tien_lai
  $("#no_goc").html(no_goc.formatMoney(0, '.', ','))
  $("#tien_lai").html(tien_lai.formatMoney(0, '.', ','))
  $("#tong_thanh_toan").html(tong_thanh_toan.formatMoney(0, '.', ','))
  return interest_rate * diffDays * total_debt
}

function remove_all_currency_mark(repString){
  return repString.replace(/,/g , "");
}

function cal_diff_days(start_date, end_date){
  var oneDay = 24*60*60*1000;
  var spt_start_date = start_date.split('/')
  var spt_end_date = end_date.split('/')
  var first_date = new Date(spt_start_date[2], spt_start_date[1] - 1, spt_start_date[0]);
  var last_date = new Date(spt_end_date[2], spt_end_date[1] - 1, spt_end_date[0]);
  var diffDays = Math.round(Math.abs((first_date.getTime() - last_date.getTime())/(oneDay)));
  return diffDays
}

function load_product_data(db){
  db.products.toArray().then(function(val){
    $('#product_name').select2({
      data: val,
      allowClear: true,
      placeholder: "Chọn sp"
    })
    $("#ma_danh_muc").val("");
    $("#ten_danh_muc").val("");
    $("#gia_danh_muc").val("");
    $('#product_table').html("");
    val.forEach(function(product){
      render_product(product)
    })
  })
}

function import_data_from_json(){
  db = initialize_database()
  data.forEach(function(currentValue, index, arr){
    db.products.where('id').equals(currentValue.id).count(function(k){
      if(k == 0){
        db.products.add(currentValue)
      }
    })
  })
}

function form_init(){
  var db = initialize_database();
  load_product_data(db)

  // var product_name = prod_data
  var dvt = [
    { id: 1, text: 'Kg' },
    { id: "1.0", text: 'Bao' },
    { id: 20, text: 'Bao 20Kg' },
    { id: 25, text: 'Bao 25Kg'},
    { id: 30, text: 'Bao 30Kg' },
    {id: 50,text: 'Bao 50Kg'},
    {id: 1000,text: 'Tấn'}
  ]

  var interest_rate = [
    {id: 0.026667, text: '0.8%'},
    {id: 0.033333, text: '1.0%'},
    {id: 0.04, text: '1.2%'},
    {id: 0.05, text: '1.5%'},
  ]

  $('#start_date').datepicker({autoclose: true});
  $('#end_date').datepicker({
      autoclose: true
    },
  ).datepicker("setDate", new Date());

  $('#dvt').select2({
    data: dvt,
    allowClear: true,
    placeholder: "Chọn DVT"
  })

  $('#debt_rate').select2({
    data: interest_rate,
    allowClear: true,
    placeholder: "Chọn lãi xuất"
  })
}

function initialize_database(){
  var db = new Dexie("productDatabase");
  db.version(1).stores({
    products: "++prod_id,id,name,price"
  });

  return db
}

function add_to_product(currentValue, db){
  db.products.where('id').equals(currentValue.id).count(function(k){
    if(k == 0){
      db.products.add(currentValue)
      load_product_data(initialize_database())
    }else{
      alert('Mã danh mục này đã tồn tại! Vui lòng chọn một mã khác')
    }
  })
}

function import_data_to_product_table(){

  if(!$('#ma_danh_muc').val()) {
    alert('Vui lòng nhập mã danh mục!')
  }else if (!$('#ten_danh_muc').val()){
    alert('Vui lòng nhập tên danh mục!')
  }else if (!$('#gia_danh_muc').val()){
    alert('Vui lòng nhập giá của danh mục!')
  }else{
    var product = {
      "id": $('#ma_danh_muc').val().latinize(),
      "text": $('#ten_danh_muc').val(),
      "price": fparse($('#gia_danh_muc').val()),
    }
    add_to_product(product, initialize_database())
  }
}

Number.prototype.formatMoney = function(c, d, t){
    var n = this,
    c = isNaN(c = Math.abs(c)) ? 2 : c,
    d = d == undefined ? "." : d,
    t = t == undefined ? "," : t,
    s = n < 0 ? "-" : "",
    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
    j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 };

 var Latinise={};Latinise.latin_map={"Á":"A","Ă":"A","Ắ":"A","Ặ":"A","Ằ":"A","Ẳ":"A","Ẵ":"A","Ǎ":"A","Â":"A","Ấ":"A","Ậ":"A","Ầ":"A","Ẩ":"A","Ẫ":"A","Ä":"A","Ǟ":"A","Ȧ":"A","Ǡ":"A","Ạ":"A","Ȁ":"A","À":"A","Ả":"A","Ȃ":"A","Ā":"A","Ą":"A","Å":"A","Ǻ":"A","Ḁ":"A","Ⱥ":"A","Ã":"A","Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ḃ":"B","Ḅ":"B","Ɓ":"B","Ḇ":"B","Ƀ":"B","Ƃ":"B","Ć":"C","Č":"C","Ç":"C","Ḉ":"C","Ĉ":"C","Ċ":"C","Ƈ":"C","Ȼ":"C","Ď":"D","Ḑ":"D","Ḓ":"D","Ḋ":"D","Ḍ":"D","Ɗ":"D","Ḏ":"D","ǲ":"D","ǅ":"D","Đ":"D","Ƌ":"D","Ǳ":"DZ","Ǆ":"DZ","É":"E","Ĕ":"E","Ě":"E","Ȩ":"E","Ḝ":"E","Ê":"E","Ế":"E","Ệ":"E","Ề":"E","Ể":"E","Ễ":"E","Ḙ":"E","Ë":"E","Ė":"E","Ẹ":"E","Ȅ":"E","È":"E","Ẻ":"E","Ȇ":"E","Ē":"E","Ḗ":"E","Ḕ":"E","Ę":"E","Ɇ":"E","Ẽ":"E","Ḛ":"E","Ꝫ":"ET","Ḟ":"F","Ƒ":"F","Ǵ":"G","Ğ":"G","Ǧ":"G","Ģ":"G","Ĝ":"G","Ġ":"G","Ɠ":"G","Ḡ":"G","Ǥ":"G","Ḫ":"H","Ȟ":"H","Ḩ":"H","Ĥ":"H","Ⱨ":"H","Ḧ":"H","Ḣ":"H","Ḥ":"H","Ħ":"H","Í":"I","Ĭ":"I","Ǐ":"I","Î":"I","Ï":"I","Ḯ":"I","İ":"I","Ị":"I","Ȉ":"I","Ì":"I","Ỉ":"I","Ȋ":"I","Ī":"I","Į":"I","Ɨ":"I","Ĩ":"I","Ḭ":"I","Ꝺ":"D","Ꝼ":"F","Ᵹ":"G","Ꞃ":"R","Ꞅ":"S","Ꞇ":"T","Ꝭ":"IS","Ĵ":"J","Ɉ":"J","Ḱ":"K","Ǩ":"K","Ķ":"K","Ⱪ":"K","Ꝃ":"K","Ḳ":"K","Ƙ":"K","Ḵ":"K","Ꝁ":"K","Ꝅ":"K","Ĺ":"L","Ƚ":"L","Ľ":"L","Ļ":"L","Ḽ":"L","Ḷ":"L","Ḹ":"L","Ⱡ":"L","Ꝉ":"L","Ḻ":"L","Ŀ":"L","Ɫ":"L","ǈ":"L","Ł":"L","Ǉ":"LJ","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ń":"N","Ň":"N","Ņ":"N","Ṋ":"N","Ṅ":"N","Ṇ":"N","Ǹ":"N","Ɲ":"N","Ṉ":"N","Ƞ":"N","ǋ":"N","Ñ":"N","Ǌ":"NJ","Ó":"O","Ŏ":"O","Ǒ":"O","Ô":"O","Ố":"O","Ộ":"O","Ồ":"O","Ổ":"O","Ỗ":"O","Ö":"O","Ȫ":"O","Ȯ":"O","Ȱ":"O","Ọ":"O","Ő":"O","Ȍ":"O","Ò":"O","Ỏ":"O","Ơ":"O","Ớ":"O","Ợ":"O","Ờ":"O","Ở":"O","Ỡ":"O","Ȏ":"O","Ꝋ":"O","Ꝍ":"O","Ō":"O","Ṓ":"O","Ṑ":"O","Ɵ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Õ":"O","Ṍ":"O","Ṏ":"O","Ȭ":"O","Ƣ":"OI","Ꝏ":"OO","Ɛ":"E","Ɔ":"O","Ȣ":"OU","Ṕ":"P","Ṗ":"P","Ꝓ":"P","Ƥ":"P","Ꝕ":"P","Ᵽ":"P","Ꝑ":"P","Ꝙ":"Q","Ꝗ":"Q","Ŕ":"R","Ř":"R","Ŗ":"R","Ṙ":"R","Ṛ":"R","Ṝ":"R","Ȑ":"R","Ȓ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꜿ":"C","Ǝ":"E","Ś":"S","Ṥ":"S","Š":"S","Ṧ":"S","Ş":"S","Ŝ":"S","Ș":"S","Ṡ":"S","Ṣ":"S","Ṩ":"S","Ť":"T","Ţ":"T","Ṱ":"T","Ț":"T","Ⱦ":"T","Ṫ":"T","Ṭ":"T","Ƭ":"T","Ṯ":"T","Ʈ":"T","Ŧ":"T","Ɐ":"A","Ꞁ":"L","Ɯ":"M","Ʌ":"V","Ꜩ":"TZ","Ú":"U","Ŭ":"U","Ǔ":"U","Û":"U","Ṷ":"U","Ü":"U","Ǘ":"U","Ǚ":"U","Ǜ":"U","Ǖ":"U","Ṳ":"U","Ụ":"U","Ű":"U","Ȕ":"U","Ù":"U","Ủ":"U","Ư":"U","Ứ":"U","Ự":"U","Ừ":"U","Ử":"U","Ữ":"U","Ȗ":"U","Ū":"U","Ṻ":"U","Ų":"U","Ů":"U","Ũ":"U","Ṹ":"U","Ṵ":"U","Ꝟ":"V","Ṿ":"V","Ʋ":"V","Ṽ":"V","Ꝡ":"VY","Ẃ":"W","Ŵ":"W","Ẅ":"W","Ẇ":"W","Ẉ":"W","Ẁ":"W","Ⱳ":"W","Ẍ":"X","Ẋ":"X","Ý":"Y","Ŷ":"Y","Ÿ":"Y","Ẏ":"Y","Ỵ":"Y","Ỳ":"Y","Ƴ":"Y","Ỷ":"Y","Ỿ":"Y","Ȳ":"Y","Ɏ":"Y","Ỹ":"Y","Ź":"Z","Ž":"Z","Ẑ":"Z","Ⱬ":"Z","Ż":"Z","Ẓ":"Z","Ȥ":"Z","Ẕ":"Z","Ƶ":"Z","Ĳ":"IJ","Œ":"OE","ᴀ":"A","ᴁ":"AE","ʙ":"B","ᴃ":"B","ᴄ":"C","ᴅ":"D","ᴇ":"E","ꜰ":"F","ɢ":"G","ʛ":"G","ʜ":"H","ɪ":"I","ʁ":"R","ᴊ":"J","ᴋ":"K","ʟ":"L","ᴌ":"L","ᴍ":"M","ɴ":"N","ᴏ":"O","ɶ":"OE","ᴐ":"O","ᴕ":"OU","ᴘ":"P","ʀ":"R","ᴎ":"N","ᴙ":"R","ꜱ":"S","ᴛ":"T","ⱻ":"E","ᴚ":"R","ᴜ":"U","ᴠ":"V","ᴡ":"W","ʏ":"Y","ᴢ":"Z","á":"a","ă":"a","ắ":"a","ặ":"a","ằ":"a","ẳ":"a","ẵ":"a","ǎ":"a","â":"a","ấ":"a","ậ":"a","ầ":"a","ẩ":"a","ẫ":"a","ä":"a","ǟ":"a","ȧ":"a","ǡ":"a","ạ":"a","ȁ":"a","à":"a","ả":"a","ȃ":"a","ā":"a","ą":"a","ᶏ":"a","ẚ":"a","å":"a","ǻ":"a","ḁ":"a","ⱥ":"a","ã":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ḃ":"b","ḅ":"b","ɓ":"b","ḇ":"b","ᵬ":"b","ᶀ":"b","ƀ":"b","ƃ":"b","ɵ":"o","ć":"c","č":"c","ç":"c","ḉ":"c","ĉ":"c","ɕ":"c","ċ":"c","ƈ":"c","ȼ":"c","ď":"d","ḑ":"d","ḓ":"d","ȡ":"d","ḋ":"d","ḍ":"d","ɗ":"d","ᶑ":"d","ḏ":"d","ᵭ":"d","ᶁ":"d","đ":"d","ɖ":"d","ƌ":"d","ı":"i","ȷ":"j","ɟ":"j","ʄ":"j","ǳ":"dz","ǆ":"dz","é":"e","ĕ":"e","ě":"e","ȩ":"e","ḝ":"e","ê":"e","ế":"e","ệ":"e","ề":"e","ể":"e","ễ":"e","ḙ":"e","ë":"e","ė":"e","ẹ":"e","ȅ":"e","è":"e","ẻ":"e","ȇ":"e","ē":"e","ḗ":"e","ḕ":"e","ⱸ":"e","ę":"e","ᶒ":"e","ɇ":"e","ẽ":"e","ḛ":"e","ꝫ":"et","ḟ":"f","ƒ":"f","ᵮ":"f","ᶂ":"f","ǵ":"g","ğ":"g","ǧ":"g","ģ":"g","ĝ":"g","ġ":"g","ɠ":"g","ḡ":"g","ᶃ":"g","ǥ":"g","ḫ":"h","ȟ":"h","ḩ":"h","ĥ":"h","ⱨ":"h","ḧ":"h","ḣ":"h","ḥ":"h","ɦ":"h","ẖ":"h","ħ":"h","ƕ":"hv","í":"i","ĭ":"i","ǐ":"i","î":"i","ï":"i","ḯ":"i","ị":"i","ȉ":"i","ì":"i","ỉ":"i","ȋ":"i","ī":"i","į":"i","ᶖ":"i","ɨ":"i","ĩ":"i","ḭ":"i","ꝺ":"d","ꝼ":"f","ᵹ":"g","ꞃ":"r","ꞅ":"s","ꞇ":"t","ꝭ":"is","ǰ":"j","ĵ":"j","ʝ":"j","ɉ":"j","ḱ":"k","ǩ":"k","ķ":"k","ⱪ":"k","ꝃ":"k","ḳ":"k","ƙ":"k","ḵ":"k","ᶄ":"k","ꝁ":"k","ꝅ":"k","ĺ":"l","ƚ":"l","ɬ":"l","ľ":"l","ļ":"l","ḽ":"l","ȴ":"l","ḷ":"l","ḹ":"l","ⱡ":"l","ꝉ":"l","ḻ":"l","ŀ":"l","ɫ":"l","ᶅ":"l","ɭ":"l","ł":"l","ǉ":"lj","ſ":"s","ẜ":"s","ẛ":"s","ẝ":"s","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ᵯ":"m","ᶆ":"m","ń":"n","ň":"n","ņ":"n","ṋ":"n","ȵ":"n","ṅ":"n","ṇ":"n","ǹ":"n","ɲ":"n","ṉ":"n","ƞ":"n","ᵰ":"n","ᶇ":"n","ɳ":"n","ñ":"n","ǌ":"nj","ó":"o","ŏ":"o","ǒ":"o","ô":"o","ố":"o","ộ":"o","ồ":"o","ổ":"o","ỗ":"o","ö":"o","ȫ":"o","ȯ":"o","ȱ":"o","ọ":"o","ő":"o","ȍ":"o","ò":"o","ỏ":"o","ơ":"o","ớ":"o","ợ":"o","ờ":"o","ở":"o","ỡ":"o","ȏ":"o","ꝋ":"o","ꝍ":"o","ⱺ":"o","ō":"o","ṓ":"o","ṑ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","õ":"o","ṍ":"o","ṏ":"o","ȭ":"o","ƣ":"oi","ꝏ":"oo","ɛ":"e","ᶓ":"e","ɔ":"o","ᶗ":"o","ȣ":"ou","ṕ":"p","ṗ":"p","ꝓ":"p","ƥ":"p","ᵱ":"p","ᶈ":"p","ꝕ":"p","ᵽ":"p","ꝑ":"p","ꝙ":"q","ʠ":"q","ɋ":"q","ꝗ":"q","ŕ":"r","ř":"r","ŗ":"r","ṙ":"r","ṛ":"r","ṝ":"r","ȑ":"r","ɾ":"r","ᵳ":"r","ȓ":"r","ṟ":"r","ɼ":"r","ᵲ":"r","ᶉ":"r","ɍ":"r","ɽ":"r","ↄ":"c","ꜿ":"c","ɘ":"e","ɿ":"r","ś":"s","ṥ":"s","š":"s","ṧ":"s","ş":"s","ŝ":"s","ș":"s","ṡ":"s","ṣ":"s","ṩ":"s","ʂ":"s","ᵴ":"s","ᶊ":"s","ȿ":"s","ɡ":"g","ᴑ":"o","ᴓ":"o","ᴝ":"u","ť":"t","ţ":"t","ṱ":"t","ț":"t","ȶ":"t","ẗ":"t","ⱦ":"t","ṫ":"t","ṭ":"t","ƭ":"t","ṯ":"t","ᵵ":"t","ƫ":"t","ʈ":"t","ŧ":"t","ᵺ":"th","ɐ":"a","ᴂ":"ae","ǝ":"e","ᵷ":"g","ɥ":"h","ʮ":"h","ʯ":"h","ᴉ":"i","ʞ":"k","ꞁ":"l","ɯ":"m","ɰ":"m","ᴔ":"oe","ɹ":"r","ɻ":"r","ɺ":"r","ⱹ":"r","ʇ":"t","ʌ":"v","ʍ":"w","ʎ":"y","ꜩ":"tz","ú":"u","ŭ":"u","ǔ":"u","û":"u","ṷ":"u","ü":"u","ǘ":"u","ǚ":"u","ǜ":"u","ǖ":"u","ṳ":"u","ụ":"u","ű":"u","ȕ":"u","ù":"u","ủ":"u","ư":"u","ứ":"u","ự":"u","ừ":"u","ử":"u","ữ":"u","ȗ":"u","ū":"u","ṻ":"u","ų":"u","ᶙ":"u","ů":"u","ũ":"u","ṹ":"u","ṵ":"u","ᵫ":"ue","ꝸ":"um","ⱴ":"v","ꝟ":"v","ṿ":"v","ʋ":"v","ᶌ":"v","ⱱ":"v","ṽ":"v","ꝡ":"vy","ẃ":"w","ŵ":"w","ẅ":"w","ẇ":"w","ẉ":"w","ẁ":"w","ⱳ":"w","ẘ":"w","ẍ":"x","ẋ":"x","ᶍ":"x","ý":"y","ŷ":"y","ÿ":"y","ẏ":"y","ỵ":"y","ỳ":"y","ƴ":"y","ỷ":"y","ỿ":"y","ȳ":"y","ẙ":"y","ɏ":"y","ỹ":"y","ź":"z","ž":"z","ẑ":"z","ʑ":"z","ⱬ":"z","ż":"z","ẓ":"z","ȥ":"z","ẕ":"z","ᵶ":"z","ᶎ":"z","ʐ":"z","ƶ":"z","ɀ":"z","ﬀ":"ff","ﬃ":"ffi","ﬄ":"ffl","ﬁ":"fi","ﬂ":"fl","ĳ":"ij","œ":"oe","ﬆ":"st","ₐ":"a","ₑ":"e","ᵢ":"i","ⱼ":"j","ₒ":"o","ᵣ":"r","ᵤ":"u","ᵥ":"v","ₓ":"x"};
 String.prototype.latinise=function(){return this.replace(/[^A-Za-z0-9\[\] ]/g,function(a){return Latinise.latin_map[a]||a})};
 String.prototype.latinize=String.prototype.latinise;
 String.prototype.isLatin=function(){return this==this.latinise()}

function import_debt_to_table(){
  var dvt = fparse($('#dvt').val())
  var quantity = fparse($("#quantity").val())
  var total_quantity =  dvt * quantity
  var formated_total_quantity = total_quantity.formatMoney('0', '.', ',')
  var tong = 0
  console.log(total_quantity)
  if(!total_quantity){
    formated_total_quantity = ''
  }

  var middle = ""
  if($("input[id='customRadioInline2']:checked").length == 1 ){
    middle = `<td class="text-right no_goc"></td>
              <td class="text-right tra_giua_ky btn-warning">`+ (fparse($('#no_goc').html())* -1).formatMoney('0', '.', ',') +`</td>
              <td class="text-right tien_lai btn-warning">`+ (fparse($('#tien_lai').html()) * -1).formatMoney('0', '.', ',') +`</td>`
    tong = (fparse($("#no_goc").html()) + fparse($("#tien_lai").html())) * -1
  }else{
    middle = `<td class="text-right no_goc">`+ $('#no_goc').html() +`</td>
              <td class="text-right tra_giua_ky"></td>
              <td class="text-right tien_lai">`+ $('#tien_lai').html() +`</td>`
    tong = fparse($("#no_goc").html()) + fparse($("#tien_lai").html())
  }

  var insert_text = `
  <tr>
    <td class="text-center noprint"><button type="button" onclick="$(this).closest('tr').remove()" class="close" style="float: none">&times;</button></td>
    <td class="text-center">`+ $('#start_date').val()+`</td>
    <td class="text-center">`+ $('#end_date').val()+`</td>
    <td class="text-center">`+ $('#diffDays').html()+`</td>
    <td class="text-left">`+ $('#product_name_mount').val()+`</td>
    <td class="text-center">`+ formated_total_quantity +`</td>
    <td class="text-right">`+ $('#price').val() +`</td>
    `+ middle +`
    <td class="text-right tong">`+ tong.formatMoney('0', '.', ',') +`</td>
    <td class="text-center">`+ $('#invoice_note').val() +`</td>
  </tr>`
  $('#detb_table_body').append(insert_text);
}

function get_current_date_time(){
  var currentdate = new Date();
  var datetime = "Ngày Xuất báo cáo: " + currentdate.getDate() + "/"+ (currentdate.getMonth() + 1)
  + "/" + currentdate.getFullYear() + ", lúc: "
  + currentdate.getHours() + ":"
  + currentdate.getMinutes() + ":" + currentdate.getSeconds();
  return datetime
}

function render_product(product) {
  var insert_text = `
  <tr>
    <td class="text-center"><button type="button" onclick="delete_product(this,'`+ product.id +`')" class="close" style="float: none">&times;</button></td>
    <td class="text-center">`+ product.prod_id +`</td>
    <td class="text-center">`+ product.id +`</td>
    <td id="prodname_`+product.prod_id+`" class="text-left prod_name">`+ product.text +`</td>
    <td id="prodprice_`+product.prod_id+`" class="text-right prod_price" style="padding-right: 30px">`+ product.price.formatMoney('0', '.', ',') +`</td>
    <td class="text-right"></td>
  </tr>`
  $('#product_table').append(insert_text);
  $('#prodname_' + product.prod_id).editable({
    type: 'text',
    title: 'Nhập tên danh mục',
    success: function(response, newValue) {
      db = initialize_database()
      db.products.where('prod_id').equals(product.prod_id).modify({text: newValue})
      rerender_product()
    }
  });
  $('#prodprice_' + product.prod_id).editable({
    type: 'text',
    title: 'Nhập giá',
    success: function(response, newValue) {
      var prod_price = fparse(newValue)
      if (prod_price){
        db = initialize_database()
        db.products.where('prod_id').equals(product.prod_id).modify({price: prod_price})
        rerender_product()
      }else{
        alert("Nhập không thành công, vui lòng thử lại!")
        rerender_product()
      }
    }
  });
}

function rerender_product(){
  db = initialize_database()
  $('#product_table').html('');
  db.products.toArray().then(function(val){
    val.forEach(function(product){
      render_product(product)
    })
  })
}

function delete_product(del_btn, id){
  $(del_btn).closest('tr').remove();
  db = initialize_database();
  db.products.where('id').equals(id).delete()
}
