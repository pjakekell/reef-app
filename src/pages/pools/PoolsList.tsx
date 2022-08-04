import { faArrowUpFromBracket, faCoins } from '@fortawesome/free-solid-svg-icons';
import { appState, hooks } from '@reef-defi/react-lib';
import Uik from '@reef-defi/ui-kit';
import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import TokenPricesContext from '../../context/TokenPricesContext';
import { POOL_CHART_URL } from '../../urls';
import './pools.css';
import PoolsSearch from './PoolsSearch';

const PoolsList = (): JSX.Element => {
  const pageCount = 10;
  const [currentPage, changePage] = useState(1);
  const [changedPage, setChangedPage] = useState(false);
  const [search, setSearch] = useState('');
  const tokenPrices = useContext(TokenPricesContext);

  const signer = hooks.useObservableState(
    appState.selectedSigner$,
  );
  const network = hooks.useObservableState(appState.currentNetwork$);
  const [pools, , count] = hooks.usePoolsList({
    limit: pageCount,
    offset: (currentPage - 1) * pageCount,
    reefscanApi: network?.reefscanUrl || '',
    search,
    signer: signer?.address || '',
    tokenPrices,
    queryType: 'All',
  });
  console.log('Count: ', count);
  const history = useHistory();
  const openPool = (
    address: string,
    action: 'trade' | 'provide' | 'withdraw' = 'trade',
  ): void => history.push(
    POOL_CHART_URL
      .replace(':address', address)
      .replace(':action', action),
  );

  if (
    !pools.length
    && !search
    && !changedPage
  ) return (<></>);

  return (
    <div className="pools__list pools__list--all">
      <div className="pools__table-top">
        <Uik.Text type="title">Pools</Uik.Text>
        <PoolsSearch
          value={search}
          onInput={(value) => { setSearch(value); }}
        />
      </div>

      <Uik.Table
        seamless
        pagination={{
          count: Math.ceil(count/pageCount),
          current: currentPage,
          onChange: (page) => { changePage(page); setChangedPage(true); },
        }}
      >
        <Uik.THead>
          <Uik.Tr>
            <Uik.Th>Pair</Uik.Th>
            <Uik.Th align="right">TVL</Uik.Th>
            <Uik.Th align="right">24h Vol.</Uik.Th>
            <Uik.Th align="right">24h Vol. %</Uik.Th>
            <Uik.Th />
          </Uik.Tr>
        </Uik.THead>

        <Uik.TBody>
          {
                pools.map((item) => (
                  <Uik.Tr
                    key={`pool-${item.address}`}
                    onClick={() => openPool(item.address)}
                  >
                    <Uik.Td>
                      <div className="pools__pair">
                        <img src={item.token1.image} alt={item.token1.name} />
                        <img src={item.token2.image} alt={item.token1.name} />
                      </div>
                      <span>
                        { item.token1.name }
                        {' '}
                        -
                        {' '}
                        { item.token2.name }
                      </span>
                    </Uik.Td>
                    <Uik.Td align="right">
                      $
                      {' '}
                      { Uik.utils.formatHumanAmount(item.tvl || '') }
                    </Uik.Td>
                    <Uik.Td align="right">
                      $
                      {' '}
                      { Uik.utils.formatHumanAmount(item.volume24h || '') }
                    </Uik.Td>
                    <Uik.Td align="right">
                      <Uik.Trend
                        type={item.volumeChange24h >= 0 ? 'good' : 'bad'}
                        direction={item.volumeChange24h >= 0 ? 'up' : 'down'}
                        text={`${item.volumeChange24h.toFixed(2)}%`}
                      />
                    </Uik.Td>
                    <Uik.Td align="right">
                      {
                        !!item.myLiquidity
                        && (
                        <Uik.Button
                          text="Withdraw"
                          icon={faArrowUpFromBracket}
                          fill
                          onClick={(e) => {
                            e.stopPropagation();
                            openPool(item.address || '', 'withdraw');
                          }}
                        />
                        )
                      }
                      <Uik.Button
                        text="Provide"
                        icon={faCoins}
                        fill
                        onClick={(e) => {
                          e.stopPropagation();
                          openPool(item.address || '', 'provide');
                        }}
                      />
                    </Uik.Td>
                  </Uik.Tr>
                ))
              }
        </Uik.TBody>
      </Uik.Table>
    </div>
  );
};

export default PoolsList;
