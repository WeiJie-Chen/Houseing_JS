// 更動securities頁面
var Branch_arr = new Array;
var Crime_arr = new Array;
var security_count=0;
var Crime_count = 0;
var comp=new Array;
var addr_arr = new Array;
var Latlng_arr = new Array;
var police_arr = new Array;
var arr_count;
var CCity;
var glo_count;
var police_count;
var dept;


$(document).ready(function() {
    $('#selectCity').change(function() {
        var CNo = $('#selectCity').val();
        CCity = $('#selectCity :selected').text();
        console.log(CCity);
        var URLs = HousingURL + "api.php?action=cityinfo&city=" + CNo;
        // var ename = new Array();
        var schoolData = new Array();
        $.ajax({

            url: URLs,
            type: "POST",
            dataType: 'XML',
            cache: false,

            success: function(response) {

                console.log(URLs);
                arr_count=0;
                if (CNo != "0")
                {
                    $('#selectToggle').attr('disabled', false);

                    $.ajax({
                        url:"public/datus.json",
                        type:"POST",
                        dataType:"json",
                        catch:false,

                        success:function(result){
                            $(result).each(function(i){

                                if( result[i].Address.match(CCity) )
                                {
                                    addr_arr[arr_count]=new Array();

                                    addr_arr[arr_count]['Address']=result[i].Address;
                                    addr_arr[arr_count]['DeptNm'] = result[i].DeptNm;
                                    addr_arr[arr_count++]['BranchNm']=result[i].BranchNm;

                                }

                            })
                            GetBranch(arr_count);
                        },
                        error:function(){
                            console.log("not found");
                            $('#selectToggle').attr('disabled', true);
                            $('#selectArea').html("<option value=''>無資料</option>");
                        }
                    })
                }
                else
                {
                    $('#selectToggle').attr('disabled', true);
                    $('#selectArea').html("<option value=''>請先選擇城市</option>");
                }
            },
            error: function(xml) {
                alert('Ajax request 發生錯誤 ' + URLs + ',' + xml);
            }
        });
    });
});



function GetBranch(count)//做分局的部分。並去除重複部分
{
    glo_count = count;
    var compare;

    var val=0;
    var flag = true;
    comp[0]="";

    var strHtml = "<option value='0'>" + "不分類" + "</option>";
    for(var i = 0 ; i < count ; i++)
    {

        for(var j = 0 ; j < comp.length && flag; j++ )
        {
            if( comp[j] == addr_arr[i]['BranchNm'] )
            {
                flag = false;
                break;
            }
        }
        if(flag)
        {
            comp[val] = addr_arr[i]['BranchNm'];
            strHtml += "<option value='" + val++ + "'>" + addr_arr[i]['BranchNm'] + "</option>";
        }
        else
        {
            flag = true;
        }
    }
    police_count = val;
    $('#selectArea').html(strHtml);

}


function Getlatlng()
{
    if (markerCluster) {
        deleteMarkers();
    }
    var branch = $('#selectArea option:selected ').text();
    console.log(branch);
    var val=0;

    for(var j = 0 ; j < glo_count ; j++){
        if(addr_arr[j]['BranchNm'].match(branch)){
            Latlng_arr[val] = new Array();
            console.log(addr_arr[j]['Address']);
            Latlng_arr[val]['DeptNm'] = addr_arr[j]['DeptNm'];
            Latlng_arr[val++]['Address'] = addr_arr[j]['Address'];
        }else if(branch == "不分類")
        {
            Latlng_arr[val] = new Array();
            console.log(addr_arr[j]['Address']);
            Latlng_arr[val]['DeptNm'] = addr_arr[j]['DeptNm'];
            Latlng_arr[val]['BranchNm'] = addr_arr[j]['BranchNm'];
            Latlng_arr[val++]['Address'] = addr_arr[j]['Address'];
        }

    }
        Crime_count = 0;
    $.ajax({//處理案發現場位置
        url:"public/Latlng.json",
        type:"POST",
        dataType:"json",
        catch:false,

        success:function(result) {
            $(result).each(function(i){
                for(var x = 0 ;x < val ; x++ )
                {
                    if( result[i].Address.match(Latlng_arr[x]['Address']) ){
                        SetPopMap(result[i].Address,result[i].Lat,result[i].Lng,false);
                        CrimeSave(result[i].Address,result[i].Lat,result[i].Lng);

                    }
                }
            })

        },
        error:function() {
            console.log("Not found!!!");
        }
    });
    security_count=0;
        $.ajax({//處理警局位置
            url:"public/police_department.json",
            type:"POST",
            dataType:"json",
            catch:false,

            success:function(result) {
                $(result).each(function(i){
                    if(branch == "不分類")
                    {
                        for(var x = 0 ; x < val ; x++)
                        {
                            if( result[i].BranchNm==Latlng_arr[x]['BranchNm'] ){
                                console.log(result[i].BranchNm);
                                dept = Latlng_arr[0]['DeptNm'];

                                SetPopMap(result[i].BranchNm,result[i].Lat,result[i].Lng,true);
                                Latlng_arr[x]['BranchNm'] ="0";//讓上面if不會重複判斷同個分局
                                BranchSave(result[i].BranchNm,result[i].Lat,result[i].Lng,false);
                                break;
                            }
                        }
                    }else if( result[i].BranchNm==branch){
                        console.log("result ="+result[i].BranchNm);
                        dept = Latlng_arr[0]['DeptNm'];

                        SetPopMap(result[i].BranchNm,result[i].Lat,result[i].Lng,true);
                        BranchSave(result[i].BranchNm,result[i].Lat,result[i].Lng,true);
                    }


                })

            },
            error:function() {
                console.log("Not found!!!");
            }
        });

        $(function(){
        setTimeout(function(){
         makeRightSB(pages);
        },500)
        })

}

function BranchSave(bran,lat,lng,branch_flag)
{
    if(branch_flag)
    {
        Branch_arr[security_count]=new Array;
        Branch_arr[0]['BranchNm'] = bran;
        Branch_arr[security_count]['Branch_lat']=lat;
        Branch_arr[security_count++]['Branch_lng']=lng;
        console.log("security_count="+security_count);
    }else{

        Branch_arr[security_count]=new Array;
        Branch_arr[security_count]['BranchNm'] =bran;
        Branch_arr[security_count]['Branch_lat']=lat;
        Branch_arr[security_count++]['Branch_lng']=lng;
    }


}



function CrimeSave(Address,lat,lng)
{
    console.log("安123安 "+Crime_count);
    Crime_arr[Crime_count] = new Array;
    Crime_arr[Crime_count]['Address'] = Address;
    Crime_arr[Crime_count]['lat'] = lat;
    Crime_arr[Crime_count++]['lng'] = lng;


}

function SetPopMap(addr,s_lat, s_lon,po) {


    console.log("lat = " + s_lat + ", lon = " + s_lon + " flag =" + po);
    if(po)
    {
        var mapOptions = {
            zoom: 18,
            center: new google.maps.LatLng(s_lat, s_lon)
        };
    }else{
        var mapOptions = {
            zoom: 8,
            center: new google.maps.LatLng(23.5989232, 121.0173463)
        };
    }
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    createPopMarkers(addr,s_lat,s_lon,po);
    stepDisplay = new google.maps.InfoWindow();

    markerCluster = new MarkerClusterer(map, markers);

}


function createPopMarkers( address,lat, lon,po) {
    var point = new google.maps.LatLng(lat, lon);
    //  infoWindow = new google.maps.InfoWindow();
    if(po){
        var marker = new google.maps.Marker({
        map: map,
        position: point,
        icon : {url:"public/police.png",scaledSize:new google.maps.Size(50,50)}
    });
    }else{
        var marker = new google.maps.Marker({
        map: map,
        position: point,
        icon : {url:"public/crime.png",scaledSize:new google.maps.Size(35,35)}
    });

    }

    //標記資訊視窗點擊事件
    if(po)
    {
        var strplace = address + "(" + dept + ")<br>";
    }else{
         var strplace = address +"<br>";
    }

    infowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, 'click', function() {

        infowindow.setContent(strplace);

        infowindow.open(map, marker);
    });

    markers.push(marker);

}

google.maps.event.addDomListener(window, 'load', initialize);

