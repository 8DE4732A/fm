import hmac
from datetime import datetime
from urllib import parse

def get_mp3_url(id) -> str:
    t = '/live/' + str(id) + '/64k.mp3'
    ts = hex(int(datetime.now().timestamp()) + 60 * 60)[2:]
    a = 'app_id=web&path=' + parse.quote(t,safe="") + '&ts=' + parse.quote(ts,safe="")
    sign = hmac.new(bytes('Lwrpu$K5oP', encoding='utf-8'), bytes(a, encoding='utf-8'), 'MD5').hexdigest()
    return 'https://lhttp.qingting.fm/live/' + str(id) + '/64k.mp3?app_id=web&ts=' + str(ts) + '&sign=' + sign

if __name__ == '__main__':
    print(get_mp3_url(273))