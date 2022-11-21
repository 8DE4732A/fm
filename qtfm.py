import hmac
import json
import sys
import requests
from datetime import datetime
from urllib import parse

def get_mp3_url(id) -> str:
    t = '/live/' + str(id) + '/64k.mp3'
    ts = '637b930f'
    a = 'app_id=web&path=' + parse.quote(t,safe="") + '&ts=' + parse.quote(ts,safe="")
    sign = hmac.new(bytes('Lwrpu$K5oP', encoding='utf-8'), bytes(a, encoding='utf-8'), 'MD5').hexdigest()
    return 'https://lhttp.qingting.fm/live/' + str(id) + '/64k.mp3?app_id=web&ts=' + str(ts) + '&sign=' + sign


def get_regions():
    r = requests.post('https://webbff.qtfm.cn/www', json={"query":"{radioPage(cid:432, page:1){bannerData,regions,radioPlaying,replayRadio,classes,}}"})
    return r.json()['data']['radioPage']['regions']


def get_radios(cid):
    r = requests.post('https://webbff.qtfm.cn/www', json={"query":"{radioPage(cid:%s, page:1){contents}}"%cid})
    return r.json()['data']['radioPage']['contents']['items']

if __name__ == '__main__':
    print(get_mp3_url(20003))
