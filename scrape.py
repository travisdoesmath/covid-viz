import pandas as pd

df = pd.read_html('https://en.wikipedia.org/wiki/Template:2019%E2%80%9320_coronavirus_pandemic_data/United_States_medical_cases')

dates = pd.to_datetime(df[0]['Date']['Date']+' 2020', format='%b %d %Y', errors='coerce')
deaths = df[0]['Deaths']['New']
out_df = pd.concat([dates, deaths], axis=1).dropna()
out_df.to_csv('covid-deaths.csv', index=False)