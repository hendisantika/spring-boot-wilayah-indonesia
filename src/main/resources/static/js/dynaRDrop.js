$(document).ready(function () {
    $("#provinsi").change(function () {
        var countryId = $(this).val();
        var s = '<option value=' + -1 + '>SELECT</option>';
        if (countryId > 0) {
            $.ajax({
                url: 'getStates',
                data: {"countryId": countryId},
                success: function (result) {
                    var result = JSON.parse(result);
                    for (var i = 0; i < result.length; i++) {
                        s += '<option value="' + result[i][0] + '">' + result[i][1] + '</option>';
                    }
                    $('#states').html(s);
                }
            });
        }
        //reset data
        $('#states').html(s);
        $('#cities').html(s);

    });

    $("#states").change(function () {
        var stateId = $(this).val();
        var s = '<option value=' + -1 + '>SELECT</option>';
        if (stateId > 0) {
            $.ajax({
                url: 'getCities',
                data: {"stateId": stateId},
                success: function (result) {
                    var result = JSON.parse(result);
                    for (var i = 0; i < result.length; i++) {
                        s += '<option value="' + result[i][0] + '">' + result[i][1] + '</option>';
                    }
                    $('#cities').html(s);
                }
            });
        }
        //reset data
        $('#cities').html(s);
    });

    $('#provinsi').on('change', function (e) {
        var province_id = e.target.value;
        $.get('/regencies?province_id=' + province_id, function (data) {
            $('#regencies').empty();
            $('#regencies').append('<option value="" disable="true" selected="true">=== Pilih Kabupaten/Kota ===</option>');

            $('#districts').empty();
            $('#districts').append('<option value="" disable="true" selected="true">=== Pilih Kecamatan ===</option>');

            $('#villages').empty();
            $('#villages').append('<option value="" disable="true" selected="true">=== Pilih Desa/Kelurahan ===</option>');

            $.each(data, function (index, regenciesObj) {
                $('#regencies').append('<option value="' + regenciesObj.id + '">' + regenciesObj.nama + '</option>');
            })
        });
    });

    $('#regencies').on('change', function (e) {
        var regencies_id = e.target.value;
        $.get('/districts?regencies_id=' + regencies_id, function (data) {
            $('#districts').empty();
            $('#districts').append('<option value="" disable="true" selected="true">=== Pilih Kecamatan ===</option>');

            $.each(data, function (index, districtsObj) {
                $('#districts').append('<option value="' + districtsObj.id + '">' + districtsObj.nama + '</option>');
            })
        });
    });

    $('#districts').on('change', function (e) {
        var districts_id = e.target.value;
        $.get('/village?districts_id=' + districts_id, function (data) {
            $('#villages').empty();
            $('#villages').append('<option value="" disable="true" selected="true">=== Pilih Desa/Kelurahan ===</option>');

            $.each(data, function (index, villagesObj) {
                $('#villages').append('<option value="' + villagesObj.id + '">' + villagesObj.nama + '</option>');

            })
        });
    });

    $('#villages').on('change', function (e) {
        console.log($("#villages option:selected").text());
        $("#namaDesa").val($("#villages option:selected").text());
    });

});
